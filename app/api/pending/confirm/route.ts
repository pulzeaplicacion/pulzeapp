import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

function isExpired(createdAt: Date) {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const diff = now - created
  return diff > 48 * 60 * 60 * 1000
}

function sha256(value: string) {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex")
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = req.headers.get("x-real-ip")
  if (realIp) {
    return realIp.trim()
  }

  return null
}

async function sendPurchaseToMeta(
  req: Request,
  params: {
    code: string
    playerName: string | null
    amount: number
    userId: string
    fbp: string | null
    fbc: string | null
    phone: string | null
  }
) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      pixelId: true,
      capiToken: true,
      landingKey: true,
    },
  })

  if (!user?.pixelId || !user?.capiToken) {
    console.error("META ERROR: falta pixelId o capiToken")
    return false
  }

  const clientIp = getClientIp(req)
  const clientUserAgent = req.headers.get("user-agent") || undefined

  const userData: Record<string, unknown> = {
    external_id: [sha256(params.code)],
  }

  if (clientIp) {
    userData.client_ip_address = clientIp
  }

  if (clientUserAgent) {
    userData.client_user_agent = clientUserAgent
  }

  if (params.fbp) {
    userData.fbp = params.fbp
  }

  if (params.fbc) {
    userData.fbc = params.fbc
  }

  // 🔥 NUEVO: PHONE
  if (params.phone) {
    userData.ph = [sha256(params.phone)]
  }

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: `https://pulze.site/${user.landingKey || params.userId}`,
        event_id: params.code,
        user_data: userData,
        custom_data: {
          currency: "ARS",
          value: params.amount,
        },
      },
    ],
  }

  const response = await fetch(
    `https://graph.facebook.com/v23.0/${user.pixelId}/events?access_token=${encodeURIComponent(user.capiToken)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  )

  const text = await response.text().catch(() => "")

  if (!response.ok) {
    console.error("META CAPI ERROR:", text)
    return false
  }

  try {
    const json = JSON.parse(text)

    if (json?.error) {
      console.error("META CAPI JSON ERROR:", json)
      return false
    }

    console.log("META CAPI OK:", json)
    return true
  } catch {
    console.error("META CAPI PARSE ERROR:", text)
    return false
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const code = String(body?.code || "").trim()
    const playerName = String(body?.playerName || "").trim()
    const amount = Number(body?.amount || 0)
    const phone = String(body?.phone || "").trim()

    if (!code) {
      return NextResponse.json(
        { error: "Falta el código" },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Monto inválido" },
        { status: 400 }
      )
    }

    const pending = await prisma.pending.findUnique({
      where: { code },
    })

    if (!pending) {
      return NextResponse.json(
        { error: "No existe el pendiente" },
        { status: 404 }
      )
    }

    if (pending.status === "confirmed") {
      return NextResponse.json(
        { error: "Este pendiente ya fue confirmado" },
        { status: 400 }
      )
    }

    if (isExpired(pending.createdAt)) {
      await prisma.pending.delete({
        where: { code },
      })

      return NextResponse.json(
        { error: "Este pendiente venció" },
        { status: 400 }
      )
    }

    const metaRows = await prisma.$queryRawUnsafe<Array<{ fbp: string | null; fbc: string | null }>>(
      `
      SELECT "fbp", "fbc"
      FROM "Pending"
      WHERE "code" = $1
      LIMIT 1
      `,
      code
    )

    const metaRow = metaRows[0] || { fbp: null, fbc: null }

    const metaOk = await sendPurchaseToMeta(req, {
      code,
      playerName: playerName || null,
      amount,
      userId: pending.userId,
      fbp: metaRow.fbp || null,
      fbc: metaRow.fbc || null,
      phone: phone || null,
    })

    if (!metaOk) {
      return NextResponse.json(
        { error: "Falló Meta, no se confirmó el jugador" },
        { status: 500 }
      )
    }

    const updated = await prisma.pending.update({
      where: { code },
      data: {
        status: "confirmed",
        confirmedAt: new Date(),
        playerName: playerName || null,
        amount,
      },
    })

    return NextResponse.json({
      ok: true,
      pending: updated,
    })
  } catch (error) {
    console.error("CONFIRM PENDING ERROR:", error)

    return NextResponse.json(
      {
        error: "Error interno",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
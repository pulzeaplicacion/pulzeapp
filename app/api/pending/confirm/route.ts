import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function isExpired(createdAt: Date) {
  const now = Date.now()
  const created = new Date(createdAt).getTime()
  const diff = now - created
  return diff > 48 * 60 * 60 * 1000
}

async function sendPurchaseToMeta(params: {
  code: string
  playerName: string | null
  amount: number
  userId: string
}) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      pixelId: true,
      capiToken: true,
    },
  })

  if (!user?.pixelId || !user?.capiToken) {
    return false
  }

  const payload = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_source_url: `https://pulze.site/${params.userId}`,
        custom_data: {
          currency: "ARS",
          value: params.amount,
        },
        custom_data_optional: {
          code: params.code,
          player_name: params.playerName || undefined,
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

  if (!response.ok) {
    const text = await response.text().catch(() => "")
    console.error("META CAPI ERROR:", text)
    return false
  }

  const json = await response.json().catch(() => null)
  if (!json || json.error) {
    console.error("META CAPI JSON ERROR:", json)
    return false
  }

  return true
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const code = String(body?.code || "").trim()
    const playerName = String(body?.playerName || "").trim()
    const amount = Number(body?.amount || 0)

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

    const metaOk = await sendPurchaseToMeta({
      code,
      playerName: playerName || null,
      amount,
      userId: pending.userId,
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
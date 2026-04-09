import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    const code = String(body?.code || "").trim()

    if (!code) {
      return NextResponse.json(
        { error: "Falta el código" },
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

    const updated = await prisma.pending.update({
      where: { code },
      data: {
        status: "confirmed",
        confirmedAt: new Date(),
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
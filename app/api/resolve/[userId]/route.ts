import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

function generateCode(length = 4) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params
    const url = new URL(req.url)

    const fbp = String(url.searchParams.get("fbp") || "").trim() || null
    const fbc = String(url.searchParams.get("fbc") || "").trim() || null

    const lines = await prisma.line.findMany({
      where: { userId },
      orderBy: { position: "asc" },
    })

    if (!lines.length) {
      return NextResponse.json(
        { error: "No hay líneas disponibles" },
        { status: 404 }
      )
    }

    let state = await prisma.roundRobinState.findUnique({
      where: { userId },
    })

    if (!state) {
      state = await prisma.roundRobinState.create({
        data: { userId, currentIndex: 0 },
      })
    }

    const currentIndex = state.currentIndex % lines.length
    const selectedLine = lines[currentIndex]
    const nextIndex = (currentIndex + 1) % lines.length

    await prisma.roundRobinState.update({
      where: { userId },
      data: { currentIndex: nextIndex },
    })

    let code = generateCode(4)
    let existing = await prisma.pending.findUnique({
      where: { code },
    })

    while (existing) {
      code = generateCode(4)
      existing = await prisma.pending.findUnique({
        where: { code },
      })
    }

    await prisma.pending.create({
      data: {
        code,
        userId,
        lineId: selectedLine.id,
        ...(fbp ? { fbp } : {}),
        ...(fbc ? { fbc } : {}),
      } as any,
    })

    const message = `Hola, quiero un usuario. BONO: ${code}`
    const whatsappUrl = `https://wa.me/${selectedLine.number}?text=${encodeURIComponent(message)}`

    return NextResponse.redirect(whatsappUrl)
  } catch (error) {
    console.error("RESOLVE ERROR:", error)

    return NextResponse.json(
      {
        error: "Error interno",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
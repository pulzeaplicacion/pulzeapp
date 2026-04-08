import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params

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

    return NextResponse.json({
      selectedLine,
      currentIndex,
      nextIndex,
    })
  } catch (error) {
    console.error("ROUND ROBIN ERROR:", error)

    return NextResponse.json(
      {
        error: "Error interno",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
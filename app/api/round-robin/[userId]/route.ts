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
      // ⚠ temporalmente sacamos position
    })

    if (!lines.length) {
      return NextResponse.json({ error: "No lines" }, { status: 404 })
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
    console.error(error)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params

    const pending = await prisma.pending.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: {
        line: true,
      },
    })

    return NextResponse.json({ pending })
  } catch (error) {
    console.error("PENDING ERROR:", error)

    return NextResponse.json(
      {
        error: "Error interno",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
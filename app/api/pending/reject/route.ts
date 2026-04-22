import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const code = String(body?.code || "").trim();

    if (!code) {
      return NextResponse.json({ error: "Falta el código" }, { status: 400 });
    }

    const pending = await prisma.pending.findFirst({
      where: {
        code,
        status: {
          not: "confirmed",
        },
      },
    });

    if (!pending) {
      return NextResponse.json(
        { error: "Pendiente no encontrado" },
        { status: 404 }
      );
    }

    await prisma.pending.delete({
      where: { id: pending.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("REJECT_PENDING_ERROR", error);

    return NextResponse.json(
      { error: "Error al rechazar pendiente" },
      { status: 500 }
    );
  }
}
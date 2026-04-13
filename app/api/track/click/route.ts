import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const user = await prisma.user.findFirst({
      where: { landingKey: "virgi" },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    await prisma.trackEvent.create({
      data: {
        userId: user.id,
        type: "click",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("TRACK CLICK ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json().catch(() => null);

    const data: {
      maxLines?: number;
      pixelId?: string | null;
      capiToken?: string | null;
    } = {};

    if (body && body.maxLines !== undefined) {
      const maxLines = Number(body.maxLines);

      if (!Number.isFinite(maxLines) || maxLines < 1) {
        return NextResponse.json(
          { error: "maxLines inválido" },
          { status: 400 }
        );
      }

      data.maxLines = maxLines;
    }

    if (body && body.pixelId !== undefined) {
      const pixelId = String(body.pixelId || "").trim();
      data.pixelId = pixelId || null;
    }

    if (body && body.capiToken !== undefined) {
      const capiToken = String(body.capiToken || "").trim();
      data.capiToken = capiToken || null;
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        maxLines: true,
        landingKey: true,
        pixelId: true,
        capiToken: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("PATCH /api/admin/users/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
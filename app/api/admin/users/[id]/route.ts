import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

function getIdFromUrl(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const maxLines = Number(body?.maxLines);

    const id = getIdFromUrl(req);

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    if (!Number.isInteger(maxLines) || maxLines < 1) {
      return NextResponse.json(
        { error: "maxLines inválido" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id },
      data: { maxLines },
      select: {
        id: true,
        email: true,
        maxLines: true,
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

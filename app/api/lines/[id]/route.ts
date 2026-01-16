import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

function getUserIdFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)auth=([^;]+)/);
  return match?.[1] || null;
}

// Fallback robusto: si params falla, lo sacamos de la URL
function getIdFromUrl(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  // /api/lines/:id  -> ultimo segmento es el id
  return parts[parts.length - 1] || null;
}

export async function PATCH(req: Request, ctx: { params?: { id?: string } }) {
  const userId = getUserIdFromCookie(req);
  if (!userId) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const id = ctx?.params?.id || getIdFromUrl(req);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const number = String(body?.number || "").trim();

  if (!name || !number) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const exists = await prisma.line.findFirst({
    where: { id, userId },
    select: { id: true },
  });

  if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const line = await prisma.line.update({
    where: { id },
    data: { name, number },
  });

  return NextResponse.json({ ok: true, line });
}

export async function DELETE(req: Request, ctx: { params?: { id?: string } }) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) return NextResponse.json({ error: "No auth" }, { status: 401 });

    const id = ctx?.params?.id || getIdFromUrl(req);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const exists = await prisma.line.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.line.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/lines/[id] error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

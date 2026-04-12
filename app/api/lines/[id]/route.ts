import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

function getUserIdFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)auth=([^;]+)/);
  return match?.[1] || null;
}

function getIdFromUrl(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "No auth" }, { status: 401 });
    }

    const { id: paramId } = await context.params;
    const id = paramId || getIdFromUrl(req);

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

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

    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const line = await prisma.line.update({
      where: { id },
      data: { name, number },
    });

    return NextResponse.json({ ok: true, line });
  } catch (err) {
    console.error("PATCH /api/lines/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "No auth" }, { status: 401 });
    }

    const { id: paramId } = await context.params;
    const id = paramId || getIdFromUrl(req);

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const exists = await prisma.line.findFirst({
      where: { id, userId },
      select: { id: true },
    });

    if (!exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.pending.deleteMany({
      where: { lineId: id },
    });

    await prisma.line.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/lines/[id] error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

function getUserIdFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)auth=([^;]+)/);
  return match?.[1] || null;
}

export async function GET(req: Request) {
  const userId = getUserIdFromCookie(req);
  if (!userId) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const [user, lines] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { maxLines: true } }),
    prisma.line.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
  ]);

  return NextResponse.json({ lines, maxLines: user?.maxLines ?? 1 });
}

export async function POST(req: Request) {
  const userId = getUserIdFromCookie(req);
  if (!userId) return NextResponse.json({ error: "No auth" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = String(body?.name || "").trim();
  const number = String(body?.number || "").trim();

  if (!name || !number) return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { maxLines: true } });
  const maxLines = user?.maxLines ?? 1;

  const count = await prisma.line.count({ where: { userId } });
  if (count >= maxLines) {
    return NextResponse.json({ error: `Límite alcanzado (${maxLines}). Necesitás upgrade.` }, { status: 403 });
  }

  const line = await prisma.line.create({ data: { name, number, userId } });
  return NextResponse.json({ ok: true, line });
}

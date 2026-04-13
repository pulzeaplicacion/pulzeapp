import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getUserIdFromCookie(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)auth=([^;]+)/);
  return match?.[1] || null;
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromCookie(req);
    if (!userId) {
      return NextResponse.json({ error: "No auth" }, { status: 401 });
    }

    const body = await req.json().catch(() => null);

    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();

    if (!name || !phone) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const vip = await prisma.vipPlayer.create({
      data: {
        name,
        phone,
        userId,
      },
    });

    return NextResponse.json({ ok: true, vip });
  } catch (err) {
    console.error("VIP ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
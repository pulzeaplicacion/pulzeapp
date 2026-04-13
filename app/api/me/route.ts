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

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      role: true,
      maxLines: true,
      landingKey: true,
    },
  });

  if (!user) return NextResponse.json({ error: "No auth" }, { status: 401 });

  return NextResponse.json({ user });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const cookie = req.headers.get("cookie") || "";
  const match = cookie.match(/(?:^|;\s*)auth=([^;]+)/);
  const userId = match?.[1];

  if (!userId) {
    return NextResponse.json({ error: "No auth" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  return NextResponse.json({ user });
}

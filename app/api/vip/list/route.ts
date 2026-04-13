import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const vip = await prisma.vipPlayer.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ vip });
  } catch (err) {
    console.error("VIP LIST ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error", vip: [] },
      { status: 500 }
    );
  }
}
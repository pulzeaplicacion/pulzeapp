import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await context.params;

    const [visits, clicks] = await Promise.all([
      prisma.trackEvent.count({
        where: {
          userId,
          type: "visit",
        },
      }),
      prisma.trackEvent.count({
        where: {
          userId,
          type: "click",
        },
      }),
    ]);

    return NextResponse.json({
      visits,
      clicks,
    });
  } catch (err) {
    console.error("TRACK STATS ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error", visits: 0, clicks: 0 },
      { status: 500 }
    );
  }
}
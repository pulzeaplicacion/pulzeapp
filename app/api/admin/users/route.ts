import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .trim();
}

async function generateUniqueLandingKey(
  email: string,
  requestedLandingKey?: string
) {
  const baseFromRequest = slugify(requestedLandingKey || "");
  const baseFromEmail = slugify(email.split("@")[0] || "");
  const base = baseFromRequest || baseFromEmail || "user";

  let candidate = base;
  let counter = 1;

  while (true) {
    const existing = await prisma.user.findUnique({
      where: { landingKey: candidate },
      select: { id: true },
    });

    if (!existing) return candidate;

    counter += 1;
    candidate = `${base}${counter}`;
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        maxLines: true,
        landingKey: true,
        pixelId: true,
        capiToken: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("GET /api/admin/users error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "").trim();
    const requestedLandingKey = String(body?.landingKey || "").trim();
    const maxLines = Number(body?.maxLines || 1);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    if (maxLines < 1) {
      return NextResponse.json(
        { error: "maxLines inválido" },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Ese email ya existe" },
        { status: 400 }
      );
    }

    const landingKey = await generateUniqueLandingKey(email, requestedLandingKey);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "user",
        maxLines,
        landingKey,
      },
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
    console.error("POST /api/admin/users error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
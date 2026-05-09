import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return null;
}

function buildFbcFromFbclid(fbclid: string | null) {
  if (!fbclid) return null;

  const clean = fbclid.trim();
  if (!clean) return null;

  return `fb.1.${Math.floor(Date.now() / 1000)}.${clean}`;
}

async function sendContactToMeta(
  req: Request,
  params: {
    userId: string;
    landingKey: string;
    pixelId: string;
    capiToken: string;
    fbp: string | null;
    fbc: string | null;
  }
) {
  try {
    const clientIp = getClientIp(req);
    const clientUserAgent = req.headers.get("user-agent") || undefined;

    const eventId = crypto.randomUUID();

    const userData: Record<string, unknown> = {};

    if (clientIp) userData.client_ip_address = clientIp;
    if (clientUserAgent) userData.client_user_agent = clientUserAgent;
    if (params.fbp) userData.fbp = params.fbp;
    if (params.fbc) userData.fbc = params.fbc;

    const payload = {
      data: [
        {
          event_name: "Contact",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: `https://pulze.site/${params.landingKey}`,
          event_id: eventId,
          user_data: userData,
          custom_data: {
            content_name: "WhatsApp Click",
            landing_key: params.landingKey,
          },
        },
      ],
    };

    const response = await fetch(
      `https://graph.facebook.com/v23.0/${params.pixelId}/events?access_token=${encodeURIComponent(
        params.capiToken
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const text = await response.text().catch(() => "");

    if (!response.ok) {
      console.error("META CONTACT CAPI ERROR:", text);
      return false;
    }

    const json = JSON.parse(text);
    console.log("META CONTACT CAPI OK:", json);

    return true;
  } catch (err) {
    console.error("META CONTACT CAPI FAILED:", err);
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    const fbp = String(url.searchParams.get("fbp") || "").trim() || null;
    const rawFbc = String(url.searchParams.get("fbc") || "").trim() || null;
    const fbclid = String(url.searchParams.get("fbclid") || "").trim() || null;
    const fbc = rawFbc || buildFbcFromFbclid(fbclid);

    if (!key) {
      return NextResponse.json(
        { error: "Missing key" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { landingKey: key },
      select: {
        id: true,
        landingKey: true,
        pixelId: true,
        capiToken: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    await prisma.trackEvent.create({
      data: {
        userId: user.id,
        type: "click",
      },
    });

    if (user.pixelId && user.capiToken) {
      await sendContactToMeta(req, {
        userId: user.id,
        landingKey: user.landingKey || key,
        pixelId: user.pixelId,
        capiToken: user.capiToken,
        fbp,
        fbc,
      });
    } else {
      console.error("META CONTACT ERROR: falta pixelId o capiToken");
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("TRACK CLICK ERROR:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
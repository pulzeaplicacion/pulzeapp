"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Me = {
  user: {
    id: string;
    email: string;
    role: string;
    landingKey: string | null;
  };
};

type PendingItem = {
  id: string;
  code: string;
  userId: string;
  lineId: string;
  status: string;
  playerName: string | null;
  amount: number | null;
  confirmedAt: string | null;
  createdAt: string;
};

type Track = {
  visits: number;
  clicks: number;
};

export default function Page() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [items, setItems] = useState<PendingItem[]>([]);
  const [track, setTrack] = useState<Track>({ visits: 0, clicks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch("/api/me");
        if (!meRes.ok) {
          setLoading(false);
          return;
        }

        const meData: Me = await meRes.json();
        setMe(meData);

        const pendingRes = await fetch(`/api/pending/${meData.user.id}`);
        const pendingData = await pendingRes.json().catch(() => ({}));

        if (pendingRes.ok) {
          setItems(pendingData.pending || []);
        }

        const trackRes = await fetch(`/api/track/stats/${meData.user.id}`);
        const trackData = await trackRes.json().catch(() => ({}));

        if (trackRes.ok) {
          setTrack({
            visits: trackData.visits || 0,
            clicks: trackData.clicks || 0,
          });
        }
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const confirmados = useMemo(
    () => items.filter((item) => item.status === "confirmed"),
    [items]
  );

  const pendientes = useMemo(
    () => items.filter((item) => item.status !== "confirmed"),
    [items]
  );

  const totalJugado = useMemo(
    () => confirmados.reduce((acc, item) => acc + (item.amount || 0), 0),
    [confirmados]
  );

  const jugadoresConfirmados = confirmados.length;

  const ticketPromedio =
    jugadoresConfirmados > 0 ? totalJugado / jugadoresConfirmados : 0;

  const conversionClickToPlayer =
    track.clicks > 0
      ? Math.round((jugadoresConfirmados / track.clicks) * 100)
      : 0;

  const conversionVisitToClick =
    track.visits > 0
      ? Math.round((track.clicks / track.visits) * 100)
      : 0;

  const conversionVisitToPlayer =
    track.visits > 0
      ? Math.round((jugadoresConfirmados / track.visits) * 100)
      : 0;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05030a] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 8%, rgba(168,85,247,0.18), transparent 28%),
            radial-gradient(circle at 14% 30%, rgba(139,92,246,0.10), transparent 22%),
            radial-gradient(circle at 86% 76%, rgba(236,72,153,0.08), transparent 24%)
          `,
        }}
      />

      <div className="relative z-10 px-3 pt-5 pb-8 sm:px-4 sm:pt-6 sm:pb-10 lg:px-6">
        <div className="mb-6 flex items-start justify-between gap-4 sm:mb-8">
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/45 backdrop-blur-sm sm:text-[11px]">
              Dashboard
            </div>

            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-none sm:mt-4 sm:text-4xl md:text-5xl">
              <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
                PANEL
              </span>{" "}
              <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                PULZE
              </span>
            </h1>

            <div className="mt-2 text-xs text-white/50 sm:mt-3 sm:text-sm">
              {me ? (
                <>
                  {me.user.email} · {me.user.role}
                </>
              ) : (
                "Cargando usuario…"
              )}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white/75 transition hover:bg-white/[0.08] hover:text-white sm:px-4 sm:text-sm"
          >
            Salir
          </button>
        </div>

        {me?.user.landingKey && (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_28px_rgba(168,85,247,0.06)] backdrop-blur-xl sm:p-5">
            <p className="text-sm text-white/60">Tu link de acceso</p>

            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <input
                value={`https://pulze.site/${me.user.landingKey}`}
                readOnly
                className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none"
              />

              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `https://pulze.site/${me.user.landingKey}`
                  );
                }}
                className="rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-sm font-medium text-white shadow-[0_0_18px_rgba(217,70,239,0.22)] transition hover:scale-[1.02] hover:shadow-[0_0_26px_rgba(217,70,239,0.28)]"
              >
                Copiar
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 grid gap-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 text-center backdrop-blur-xl shadow-[0_0_18px_rgba(168,85,247,0.06)] sm:p-4">
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />
              <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-2xl" />
              <p className="relative text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {track.visits}
              </p>
              <p className="relative mt-2 text-[10px] leading-[1.15] text-white/50 sm:text-[11px]">
                Visitas
                <br />
                landing
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 text-center backdrop-blur-xl shadow-[0_0_18px_rgba(168,85,247,0.06)] sm:p-4">
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-pink-400/60 to-transparent" />
              <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-pink-500/10 blur-2xl" />
              <p className="relative text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {track.clicks}
              </p>
              <p className="relative mt-2 text-[10px] leading-[1.15] text-white/50 sm:text-[11px]">
                Click
                <br />
                WhatsApp
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 text-center backdrop-blur-xl shadow-[0_0_18px_rgba(168,85,247,0.06)] sm:p-4">
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent" />
              <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-violet-500/10 blur-2xl" />
              <p className="relative text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                {jugadoresConfirmados}
              </p>
              <p className="relative mt-2 text-[10px] leading-[1.15] text-white/50 sm:text-[11px]">
                Jugadores
                <br />
                confirmados
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 text-center backdrop-blur-xl shadow-[0_0_18px_rgba(168,85,247,0.06)] sm:p-4">
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
              <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-2xl" />
              <p className="relative text-xl font-semibold tracking-tight text-white sm:text-2xl">
                ${totalJugado.toLocaleString("es-AR")}
              </p>
              <p className="relative mt-2 text-[10px] leading-[1.15] text-white/50 sm:text-[11px]">
                Total jugado
              </p>
            </div>

            <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 text-center backdrop-blur-xl shadow-[0_0_18px_rgba(168,85,247,0.06)] sm:p-4">
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
              <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-2xl" />
              <p className="relative text-xl font-semibold tracking-tight text-white sm:text-2xl">
                ${Math.round(ticketPromedio).toLocaleString("es-AR")}
              </p>
              <p className="relative mt-2 text-[10px] leading-[1.15] text-white/50 sm:text-[11px]">
                Ticket promedio
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 sm:mt-10">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_28px_rgba(217,70,239,0.06)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.8)]" />
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Resumen actual
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Pendientes</span>
                <span className="text-yellow-400">{pendientes.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Confirmados</span>
                <span className="text-green-400">{confirmados.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Total jugado</span>
                <span className="text-white">
                  ${totalJugado.toLocaleString("es-AR")}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_28px_rgba(139,92,246,0.06)] backdrop-blur-xl sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_14px_rgba(217,70,239,0.8)]" />
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Funnel base
              </h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Visitas → Click</span>
                <span className="text-white">{conversionVisitToClick}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Click → Jugador</span>
                <span className="text-white">{conversionClickToPlayer}%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Visitas → Jugador</span>
                <span className="text-white">{conversionVisitToPlayer}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
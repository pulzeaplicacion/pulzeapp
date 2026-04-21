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
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-140px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-fuchsia-600/25 blur-[120px]" />
        <div className="absolute left-[10%] top-[25%] h-[240px] w-[240px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[8%] h-[260px] w-[260px] rounded-full bg-pink-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/45 backdrop-blur-sm">
              Dashboard
            </div>

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-none md:text-5xl">
              <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
                PANEL
              </span>{" "}
              <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
                PULZE
              </span>
            </h1>

            <div className="mt-3 text-sm text-white/50">
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
            className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
          >
            Salir
          </button>
        </div>

        {me?.user.landingKey && (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(168,85,247,0.08)] backdrop-blur-xl">
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
                className="rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-sm font-medium text-white shadow-[0_0_25px_rgba(217,70,239,0.25)] transition hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(217,70,239,0.35)]"
              >
                Copiar
              </button>
            </div>
          </div>
        )}

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.08)]">
            <p className="text-3xl font-semibold text-white">{track.visits}</p>
            <p className="mt-1 text-[10px] text-white/45">Visitas</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.08)]">
            <p className="text-3xl font-semibold text-white">{track.clicks}</p>
            <p className="mt-1 text-[10px] text-white/45">Clicks</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-center backdrop-blur-xl shadow-[0_0_25px_rgba(168,85,247,0.08)]">
            <p className="text-3xl font-semibold text-white">
              {jugadoresConfirmados}
            </p>
            <p className="mt-1 text-[10px] text-white/45">Jugadores</p>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(217,70,239,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.9)]" />
              <h2 className="text-xl font-semibold text-white">Resumen actual</h2>
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

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(139,92,246,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.9)]" />
              <h2 className="text-xl font-semibold text-white">Funnel base</h2>
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
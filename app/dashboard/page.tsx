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
    <div className="min-h-screen text-white">
      {/* HEADER */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-widest text-white/50">
            Dashboard
          </div>

          <h1 className="mt-4 text-4xl font-semibold">
            <span className="text-gradient">Panel</span> principal
          </h1>

          <p className="mt-2 text-white/60">
            Seguimiento general de tráfico y conversiones
          </p>

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

        <button onClick={handleLogout} className="btn-secondary">
          Salir
        </button>
      </div>

      {/* LINK */}
      {me?.user.landingKey && (
        <div className="card p-4 mb-6">
          <p className="text-sm text-white/60">Tu link</p>

          <div className="mt-2 flex gap-2">
            <input
              value={`https://pulze.site/${me.user.landingKey}`}
              readOnly
              className="input flex-1 text-sm"
            />

            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  `https://pulze.site/${me.user.landingKey}`
                )
              }
              className="btn-primary text-xs"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {/* MÉTRICAS */}
      <div className="grid gap-4 md:grid-cols-5">
        <div className="card p-4">
          <p className="text-sm text-white/60">Visitas</p>
          <p className="mt-2 text-3xl font-semibold">{track.visits}</p>
        </div>

        <div className="card p-4">
          <p className="text-sm text-white/60">Clicks</p>
          <p className="mt-2 text-3xl font-semibold">{track.clicks}</p>
        </div>

        <div className="card p-4">
          <p className="text-sm text-white/60">Jugadores</p>
          <p className="mt-2 text-3xl font-semibold">
            {jugadoresConfirmados}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-sm text-white/60">Total</p>
          <p className="mt-2 text-3xl font-semibold text-green-400">
            ${totalJugado.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="card p-4">
          <p className="text-sm text-white/60">Promedio</p>
          <p className="mt-2 text-3xl font-semibold">
            ${Math.round(ticketPromedio).toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      {/* BLOQUES */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4">Resumen</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Pendientes</span>
              <span className="text-yellow-400">{pendientes.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">Confirmados</span>
              <span className="text-green-400">{confirmados.length}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">Total</span>
              <span>${totalJugado.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4">Funnel</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Visita → Click</span>
              <span>{conversionVisitToClick}%</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">Click → Jugador</span>
              <span>{conversionClickToPlayer}%</span>
            </div>

            <div className="flex justify-between">
              <span className="text-white/60">Visita → Jugador</span>
              <span>{conversionVisitToPlayer}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ESTADO */}
      <div className="mt-6 card p-4">
        <h2 className="text-lg font-semibold">Estado</h2>
        <p className="mt-2 text-sm text-white/60">
          {loading
            ? "Cargando datos…"
            : "Panel funcionando con métricas reales."}
        </p>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Me = {
  user: {
    id: string;
    email: string;
    role: string;
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

export default function Page() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [items, setItems] = useState<PendingItem[]>([]);
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

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-white/60">Analytics base del panel</p>

          <div className="mt-3 text-sm text-white/60">
            {me ? (
              <>
                Logueado como: <span className="text-white">{me.user.email}</span>{" "}
                · Rol: <span className="text-white">{me.user.role}</span>
              </>
            ) : (
              "Cargando usuario…"
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Salir
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Visitas</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Clicks WhatsApp</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Jugadores confirmados</p>
          <p className="mt-2 text-3xl font-semibold">{jugadoresConfirmados}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Total jugado</p>
          <p className="mt-2 text-3xl font-semibold text-green-400">
            ${totalJugado.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Ticket promedio</p>
          <p className="mt-2 text-3xl font-semibold">
            ${Math.round(ticketPromedio).toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Resumen actual</h2>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Pendientes</span>
              <span className="text-yellow-400">{pendientes.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Confirmados</span>
              <span className="text-green-400">{confirmados.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Total jugado</span>
              <span>${totalJugado.toLocaleString("es-AR")}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-lg font-semibold">Funnel base</h2>
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Visitas → Click</span>
              <span>—</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Click → Jugador</span>
              <span>—</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Visitas → Jugador</span>
              <span>—</span>
            </div>
          </div>
          <p className="mt-4 text-xs text-white/40">
            Se completa cuando sumemos tracking de visitas y clicks.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
        <h2 className="text-lg font-semibold">Estado del panel</h2>
        <p className="mt-2 text-sm text-white/60">
          {loading
            ? "Cargando datos…"
            : "Este dashboard ya usa confirmados reales para las métricas principales. Visitas, clicks y funnel se completan cuando conectemos el tracking de landing."}
        </p>
      </div>
    </div>
  );
}
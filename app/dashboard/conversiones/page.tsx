"use client";

import { useEffect, useMemo, useState } from "react";

type PendingItem = {
  id: string;
  code: string;
  userId: string;
  lineId: string;
  line?: {
    name: string;
    number: string;
  };
  status: string;
  playerName: string | null;
  amount: number | null;
  confirmedAt: string | null;
  createdAt: string;
};

type MeResponse = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

export default function Page() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingCode, setConfirmingCode] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [filter, setFilter] = useState("all");
  const [userId, setUserId] = useState("");

  async function loadPending(currentUserId?: string) {
    try {
      const finalUserId = currentUserId || userId;
      if (!finalUserId) return;

      const res = await fetch(`/api/pending/${finalUserId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error cargando pendientes");
      }

      setPending(data.pending || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error interno");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch("/api/me");
        const meData: MeResponse = await meRes.json();

        if (!meRes.ok || !meData?.user?.id) {
          throw new Error("No se pudo obtener el usuario");
        }

        setUserId(meData.user.id);
        await loadPending(meData.user.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error interno");
        setLoading(false);
      }
    }

    init();
  }, []);

  function openConfirmModal(code: string) {
    setSelectedCode(code);
    setPlayerName("");
    setAmount("");
    setPhone("");
  }

  function closeConfirmModal() {
    setSelectedCode("");
    setPlayerName("");
    setAmount("");
    setPhone("");
  }

  async function handleConfirm() {
    try {
      if (!selectedCode) return;

      setConfirmingCode(selectedCode);

      const res = await fetch("/api/pending/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: selectedCode,
          playerName,
          amount,
          phone,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error confirmando");
      }

      closeConfirmModal();
      await loadPending();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error interno");
    } finally {
      setConfirmingCode("");
    }
  }

  function isInFilter(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    if (filter === "today") {
      return date.toDateString() === now.toDateString();
    }

    if (filter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return date.toDateString() === yesterday.toDateString();
    }

    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    }

    return true;
  }

  const filtered = useMemo(
    () => pending.filter((p) => isInFilter(p.createdAt)),
    [pending, filter]
  );

  const pendientes = filtered.filter((p) => p.status !== "confirmed");
  const confirmados = filtered.filter((p) => p.status === "confirmed");

  const total = confirmados.reduce((acc, item) => acc + (item.amount || 0), 0);
  const jugadores = confirmados.length;
  const promedio = jugadores > 0 ? total / jugadores : 0;

  return (
<div className="relative min-h-screen overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-140px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-fuchsia-600/25 blur-[120px]" />
        <div className="absolute left-[10%] top-[25%] h-[240px] w-[240px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[8%] h-[260px] w-[260px] rounded-full bg-pink-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/45 backdrop-blur-sm">
            Conversiones
          </div>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-none md:text-5xl">
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
              Controlá tus
            </span>{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              conversiones
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-white/55 md:text-base">
            Seguimiento de bonos, pendientes y confirmados con una vista más
            limpia para operar rápido.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: "all", label: "Todo" },
            { key: "today", label: "Hoy" },
            { key: "yesterday", label: "Ayer" },
            { key: "week", label: "7 días" },
          ].map((f) => {
            const active = filter === f.key;

            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={[
                  "rounded-full border px-4 py-2 text-sm transition-all duration-200",
                  active
                    ? "border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-[0_0_30px_rgba(192,38,211,0.24)]"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(168,85,247,0.08)] backdrop-blur-xl">
            <p className="text-sm text-white/50">Total generado</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              ${total.toLocaleString("es-AR")}
            </p>
            <div className="mt-3 h-px bg-gradient-to-r from-fuchsia-500/40 to-transparent" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(168,85,247,0.08)] backdrop-blur-xl">
            <p className="text-sm text-white/50">Jugadores</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              {jugadores}
            </p>
            <div className="mt-3 h-px bg-gradient-to-r from-pink-500/40 to-transparent" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(168,85,247,0.08)] backdrop-blur-xl">
            <p className="text-sm text-white/50">Promedio</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
              ${Math.round(promedio).toLocaleString("es-AR")}
            </p>
            <div className="mt-3 h-px bg-gradient-to-r from-violet-500/40 to-transparent" />
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.9)]" />
            <h2 className="text-xl font-semibold text-white">Pendientes</h2>
          </div>

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-white/60 backdrop-blur-xl">
              Cargando pendientes...
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-5 text-red-300 backdrop-blur-xl">
              {error}
            </div>
          )}

          {!loading && !error && pendientes.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-white/55 backdrop-blur-xl">
              No hay pendientes.
            </div>
          )}

          {!loading && !error && pendientes.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_0_50px_rgba(217,70,239,0.08)] backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-white/[0.03] text-white/60">
                    <tr className="text-left">
                      <th className="px-5 py-4 font-medium">Bono</th>
                      <th className="px-5 py-4 font-medium">Línea</th>
                      <th className="px-5 py-4 font-medium">Fecha</th>
                      <th className="px-5 py-4 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendientes.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-white/10 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 font-semibold text-fuchsia-200">
                            {item.code}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white/70">
                          {item.line?.name || item.lineId}
                        </td>
                        <td className="px-5 py-4 text-white/55">
                          {new Date(item.createdAt).toLocaleString("es-AR")}
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => openConfirmModal(item.code)}
                            className="rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2 font-medium text-white shadow-[0_0_25px_rgba(217,70,239,0.25)] transition hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(217,70,239,0.35)]"
                          >
                            Confirmar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-12">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.9)]" />
            <h2 className="text-xl font-semibold text-white">Confirmados</h2>
          </div>

          {!loading && !error && confirmados.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-white/55 backdrop-blur-xl">
              No hay confirmados.
            </div>
          )}

          {!loading && !error && confirmados.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_0_50px_rgba(139,92,246,0.08)] backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-sm">
                  <thead className="bg-white/[0.03] text-white/60">
                    <tr className="text-left">
                      <th className="px-5 py-4 font-medium">Bono</th>
                      <th className="px-5 py-4 font-medium">Línea</th>
                      <th className="px-5 py-4 font-medium">Jugador</th>
                      <th className="px-5 py-4 font-medium">Monto</th>
                      <th className="px-5 py-4 font-medium">Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmados.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-white/10 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-200">
                            {item.code}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-white/70">
                          {item.line?.name || item.lineId}
                        </td>
                        <td className="px-5 py-4 text-white/70">
                          {item.playerName || "—"}
                        </td>
                        <td className="px-5 py-4 font-medium text-white">
                          {item.amount
                            ? `$${item.amount.toLocaleString("es-AR")}`
                            : "—"}
                        </td>
                        <td className="px-5 py-4 text-white/55">
                          {new Date(item.createdAt).toLocaleString("es-AR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a10] p-6 shadow-[0_0_80px_rgba(217,70,239,0.18)]">
            <div className="pointer-events-none absolute left-1/2 top-[-80px] h-40 w-40 -translate-x-1/2 rounded-full bg-fuchsia-600/25 blur-[80px]" />

            <div className="relative z-10">
              <div className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-fuchsia-200">
                Confirmación
              </div>

              <h2 className="mt-4 text-2xl font-semibold">
                Confirmar bono{" "}
                <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                  {selectedCode}
                </span>
              </h2>

              <div className="mt-6">
                <label className="mb-2 block text-sm text-white/65">
                  Jugador / Apodo
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06]"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/65">
                  Monto
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06]"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/65">
                  Teléfono (opcional)
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 3411234567"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06]"
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeConfirmModal}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white/75 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={confirmingCode === selectedCode}
                  className="w-full rounded-2xl border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-3 font-medium text-white shadow-[0_0_30px_rgba(217,70,239,0.28)] transition hover:scale-[1.01] hover:shadow-[0_0_38px_rgba(217,70,239,0.35)] disabled:opacity-50"
                >
                  {confirmingCode === selectedCode
                    ? "Confirmando..."
                    : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
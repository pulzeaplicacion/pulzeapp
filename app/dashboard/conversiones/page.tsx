"use client";

import { useEffect, useState } from "react";

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

  const filtered = pending.filter((p) => isInFilter(p.createdAt));

  const pendientes = filtered.filter((p) => p.status !== "confirmed");
  const confirmados = filtered.filter((p) => p.status === "confirmed");

  const total = confirmados.reduce((acc, item) => acc + (item.amount || 0), 0);
  const jugadores = confirmados.length;
  const promedio = jugadores > 0 ? total / jugadores : 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold">Conversiones</h1>

      <div className="mt-4 flex gap-2">
        {[
          { key: "all", label: "Todo" },
          { key: "today", label: "Hoy" },
          { key: "yesterday", label: "Ayer" },
          { key: "week", label: "7 días" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1 text-sm ${
              filter === f.key
                ? "bg-white text-black"
                : "bg-white/10 text-white hover:bg-white/20"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <p className="text-sm text-white/60">Total generado</p>
          <p className="mt-1 text-xl font-semibold text-green-400">
            ${total.toLocaleString("es-AR")}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <p className="text-sm text-white/60">Jugadores</p>
          <p className="mt-1 text-xl font-semibold">{jugadores}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900 p-4">
          <p className="text-sm text-white/60">Promedio</p>
          <p className="mt-1 text-xl font-semibold">
            ${Math.round(promedio).toLocaleString("es-AR")}
          </p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-yellow-400">Pendientes</h2>

      {loading && <p className="mt-2 text-white/60">Cargando pendientes...</p>}
      {error && <p className="mt-2 text-red-400">{error}</p>}

      {!loading && !error && pendientes.length === 0 && (
        <p className="mt-2 text-white/60">No hay pendientes.</p>
      )}

      {!loading && !error && pendientes.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="px-4 py-3">Bono</th>
                <th className="px-4 py-3">Línea</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold">{item.code}</td>
                  <td className="px-4 py-3 text-white/70">
                    {item.line?.name || item.lineId}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {new Date(item.createdAt).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openConfirmModal(item.code)}
                      className="rounded-lg bg-green-600 px-3 py-1 text-white hover:bg-green-500"
                    >
                      Confirmar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-10 text-lg font-semibold text-green-400">Confirmados</h2>

      {!loading && !error && confirmados.length === 0 && (
        <p className="mt-2 text-white/60">No hay confirmados.</p>
      )}

      {!loading && !error && confirmados.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="px-4 py-3">Bono</th>
                <th className="px-4 py-3">Línea</th>
                <th className="px-4 py-3">Jugador</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {confirmados.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold">{item.code}</td>
                  <td className="px-4 py-3 text-white/70">
                    {item.line?.name || item.lineId}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {item.playerName || "—"}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {item.amount
                      ? `$${item.amount.toLocaleString("es-AR")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {new Date(item.createdAt).toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl">
            <h2 className="text-xl font-semibold">
              Confirmar bono {selectedCode}
            </h2>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-white/70">
                Jugador / Apodo
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-white/70">
                Monto
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm text-white/70">
                Teléfono (opcional)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej: 3411234567"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={closeConfirmModal}
                className="w-full rounded-xl border border-white/10 px-4 py-3 text-white/80 hover:bg-white/5"
              >
                Cancelar
              </button>

              <button
                onClick={handleConfirm}
                disabled={confirmingCode === selectedCode}
                className="w-full rounded-xl bg-green-600 px-4 py-3 text-white hover:bg-green-500 disabled:opacity-50"
              >
                {confirmingCode === selectedCode
                  ? "Confirmando..."
                  : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
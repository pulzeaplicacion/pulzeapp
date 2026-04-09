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

export default function Page() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingCode, setConfirmingCode] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [amount, setAmount] = useState("");

  async function loadPending() {
    try {
      const res = await fetch("/api/pending/test-user-1");
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
    loadPending();
  }, []);

  function openConfirmModal(code: string) {
    setSelectedCode(code);
    setPlayerName("");
    setAmount("");
  }

  function closeConfirmModal() {
    setSelectedCode("");
    setPlayerName("");
    setAmount("");
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

  const pendientes = pending.filter((p) => p.status !== "confirmed");
  const confirmados = pending.filter((p) => p.status === "confirmed");

  return (
    <div>
      <h1 className="text-2xl font-semibold">Conversiones</h1>

      {/* 🔶 PENDIENTES */}
      <h2 className="mt-6 text-lg font-semibold text-yellow-400">Pendientes</h2>

      {pendientes.length === 0 && (
        <p className="mt-2 text-white/60">No hay pendientes.</p>
      )}

      {pendientes.length > 0 && (
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

      {/* 🟢 CONFIRMADOS */}
      <h2 className="mt-10 text-lg font-semibold text-green-400">Confirmados</h2>

      {confirmados.length === 0 && (
        <p className="mt-2 text-white/60">No hay confirmados.</p>
      )}

      {confirmados.length > 0 && (
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

      {/* MODAL */}
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
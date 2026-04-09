"use client";

import { useEffect, useState } from "react";

type PendingItem = {
  id: string;
  code: string;
  userId: string;
  lineId: string;
  status: string;
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

  return (
    <div>
      <h1 className="text-2xl font-semibold">Conversiones</h1>
      <p className="mt-2 text-white/60">Pendientes generados desde la landing</p>

      {loading && (
        <p className="mt-6 text-white/60">Cargando pendientes...</p>
      )}

      {error && (
        <p className="mt-6 text-red-400">{error}</p>
      )}

      {!loading && !error && pending.length === 0 && (
        <p className="mt-6 text-white/60">No hay pendientes todavía.</p>
      )}

      {!loading && !error && pending.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-white/5">
              <tr className="text-left">
                <th className="px-4 py-3">Bono</th>
                <th className="px-4 py-3">Línea</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold">{item.code}</td>
                  <td className="px-4 py-3 text-white/70">{item.lineId}</td>
                  <td className="px-4 py-3">
                    {item.status === "confirmed" ? (
                      <span className="text-green-400">Confirmado</span>
                    ) : (
                      <span className="text-yellow-400">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {new Date(item.createdAt).toLocaleString("es-AR")}
                  </td>
                  <td className="px-4 py-3">
                    {item.status === "confirmed" ? (
                      <span className="text-white/40">—</span>
                    ) : (
                      <button
                        onClick={() => openConfirmModal(item.code)}
                        className="rounded-lg bg-green-600 px-3 py-1 text-white hover:bg-green-500"
                      >
                        Confirmar
                      </button>
                    )}
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
            <h2 className="text-xl font-semibold">Confirmar bono {selectedCode}</h2>

            <div className="mt-5">
              <label className="mb-2 block text-sm text-white/70">
                Jugador / Apodo
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
                placeholder="Ej: juan123"
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
                placeholder="Ej: 15000"
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
                className="w-full rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-500 disabled:opacity-50"
              >
                {confirmingCode === selectedCode ? "Confirmando..." : "Confirmar jugador"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
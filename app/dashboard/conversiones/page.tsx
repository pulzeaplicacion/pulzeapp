"use client";

import { useEffect, useState } from "react";

type PendingItem = {
  id: string;
  code: string;
  userId: string;
  lineId: string;
  createdAt: string;
};

export default function Page() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

    loadPending();
  }, []);

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
                <th className="px-4 py-3">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pending.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="px-4 py-3 font-semibold">{item.code}</td>
                  <td className="px-4 py-3 text-white/70">{item.lineId}</td>
                  <td className="px-4 py-3 text-white/70">
                    {new Date(item.createdAt).toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
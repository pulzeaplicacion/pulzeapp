"use client";

import { useEffect, useState } from "react";

type Line = {
  id: string;
  name: string;
  number: string;
  isActive: boolean;
};

export default function Page() {
  const [lines, setLines] = useState<Line[]>([]);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/lines");
    const data = await res.json().catch(() => ({}));
    setLines(data.lines || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function createLine() {
    setError("");
    setLoading(true);

    const res = await fetch("/api/lines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, number }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.error || "Error");
      return;
    }

    setName("");
    setNumber("");
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Líneas</h1>
      <p className="mt-2 text-white/60">Tus números de WhatsApp para atención</p>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre (Ej: Morena)"
          className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
        />
        <input
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder="Número (Ej: +54911...)"
          className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
        />
        <button
          onClick={createLine}
          disabled={loading}
          className="rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 transition px-4 py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Agregar"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="mt-6 space-y-3">
        {lines.map((l) => (
          <div
            key={l.id}
            className="rounded-2xl border border-white/10 bg-white/5 p-4 flex items-center justify-between"
          >
            <div>
              <div className="font-medium">{l.name}</div>
              <div className="text-sm text-white/60">{l.number}</div>
            </div>
            <div className="text-xs text-white/60">
              {l.isActive ? "Activa" : "Desactivada"}
            </div>
          </div>
        ))}

        {lines.length === 0 && (
          <div className="text-sm text-white/50">Todavía no agregaste líneas.</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";

type Line = {
  id: string;
  name: string;
  number: string;
};

export default function LineasPage() {
  const [lines, setLines] = useState<Line[]>([]);
  const [maxLines, setMaxLines] = useState<number>(1);

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [error, setError] = useState("");

  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");

  async function load() {
    const res = await fetch("/api/lines", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setLines(data.lines || []);
    setMaxLines(typeof data.maxLines === "number" ? data.maxLines : 1);
  }

  useEffect(() => {
    load();
  }, []);

  const limitReached = lines.length >= maxLines;

  async function addLine() {
    if (!name || !number) {
      setError("Completá nombre y número");
      return;
    }

    setError("");
    setLoadingAdd(true);

    const res = await fetch("/api/lines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, number }),
    });

    const data = await res.json().catch(() => ({}));
    setLoadingAdd(false);

    if (!res.ok) {
      setError(data?.error || "Error");
      return;
    }

    setName("");
    setNumber("");
    await load();
  }

  async function removeLine(id: string) {
    setError("");
    setLoadingId(id);

    const res = await fetch(`/api/lines/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    setLoadingId(null);

    if (!res.ok) {
      setError(data?.error || "Error");
      return;
    }

    await load();
  }

  function startEdit(l: Line) {
    setError("");
    setEditingId(l.id);
    setEditName(l.name);
    setEditNumber(l.number);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditNumber("");
  }

  async function saveEdit(id: string) {
    if (!editName || !editNumber) {
      setError("Completá nombre y número");
      return;
    }

    setError("");
    setLoadingId(id);

    const res = await fetch(`/api/lines/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, number: editNumber }),
    });

    const data = await res.json().catch(() => ({}));
    setLoadingId(null);

    if (!res.ok) {
      setError(data?.error || "Error");
      return;
    }

    cancelEdit();
    await load();
  }

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* FONDO GLOW */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-140px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-fuchsia-600/25 blur-[120px]" />
        <div className="absolute left-[10%] top-[25%] h-[240px] w-[240px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[8%] h-[260px] w-[260px] rounded-full bg-pink-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/45 backdrop-blur-sm">
            Líneas
          </div>

          <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
              Gestión de tus
            </span>{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              líneas
            </span>
          </h1>

          <p className="mt-4 text-white/55">
            Usadas: {lines.length} / {maxLines}
          </p>
        </div>

        {/* AGREGAR */}
        {!limitReached ? (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(217,70,239,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.9)]" />
              <h2 className="text-xl font-semibold">Agregar línea</h2>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <input
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none"
                placeholder="Nombre (Ej: Morena)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm outline-none"
                placeholder="Número (Ej: +54911...)"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />

              <button
                onClick={addLine}
                disabled={loadingAdd}
                className="rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-sm font-medium text-white shadow-[0_0_25px_rgba(217,70,239,0.25)] transition hover:scale-[1.02]"
              >
                {loadingAdd ? "..." : "Agregar"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-5 text-sm">
            Límite alcanzado. Necesitás upgrade para agregar más líneas.
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}

        {/* LISTA */}
        <div className="space-y-3">
          {lines.map((l) => (
            <div
              key={l.id}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(168,85,247,0.08)] backdrop-blur-xl"
            >
              {editingId === l.id ? (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex w-full gap-2">
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                    <input
                      className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm"
                      value={editNumber}
                      onChange={(e) => setEditNumber(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(l.id)}
                      className="btn-secondary"
                    >
                      Guardar
                    </button>
                    <button onClick={cancelEdit} className="btn-secondary">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-semibold">{l.name}</div>
                    <div className="text-sm text-white/55">{l.number}</div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(l)}
                      className="btn-secondary"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => removeLine(l.id)}
                      className="btn-secondary text-red-400"
                    >
                      {loadingId === l.id ? "..." : "Borrar"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
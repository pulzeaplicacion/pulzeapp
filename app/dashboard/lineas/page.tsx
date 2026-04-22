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
    <div className="relative min-h-screen overflow-x-hidden bg-[#05030a] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 8%, rgba(168,85,247,0.18), transparent 28%),
            radial-gradient(circle at 14% 30%, rgba(139,92,246,0.10), transparent 22%),
            radial-gradient(circle at 86% 76%, rgba(236,72,153,0.08), transparent 24%)
          `,
        }}
      />

      <div className="relative z-10 px-3 pt-5 pb-8 sm:px-4 sm:pt-6 sm:pb-10 lg:px-6">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/45 backdrop-blur-sm sm:text-[11px]">
            Líneas
          </div>

          <h1 className="mt-3 text-3xl font-semibold leading-none sm:mt-4 sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
              Gestión de tus
            </span>{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              líneas
            </span>
          </h1>

          <p className="mt-3 text-xs text-white/55 sm:mt-4 sm:text-sm">
            Usadas: {lines.length} / {maxLines}
          </p>
        </div>

        {!limitReached ? (
          <div className="relative mb-6 overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_0_28px_rgba(217,70,239,0.06)] backdrop-blur-xl sm:p-5">
            <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />
            <div className="pointer-events-none absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-4 flex items-center gap-3">
                <div className="h-2.5 w-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_14px_rgba(217,70,239,0.8)]" />
                <h2 className="text-lg font-semibold text-white sm:text-xl">
                  Agregar línea
                </h2>
              </div>

              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <div>
                  <label className="mb-1.5 block text-xs text-white/65 sm:text-sm">
                    Nombre
                  </label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06] sm:py-3"
                    placeholder=""
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs text-white/65 sm:text-sm">
                    Número
                  </label>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06] sm:py-3"
                    placeholder=""
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    onClick={addLine}
                    disabled={loadingAdd}
                    className="w-full rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_18px_rgba(217,70,239,0.22)] transition hover:scale-[1.02] hover:shadow-[0_0_26px_rgba(217,70,239,0.28)] disabled:opacity-50 md:w-auto"
                  >
                    {loadingAdd ? "Agregando..." : "Agregar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 rounded-3xl border border-yellow-400/20 bg-yellow-500/10 p-4 text-sm text-yellow-100 backdrop-blur-xl sm:p-5">
            Límite alcanzado. Necesitás upgrade para agregar más líneas.
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {lines.map((l) => (
            <div
              key={l.id}
              className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_0_18px_rgba(168,85,247,0.06)] backdrop-blur-xl transition hover:bg-white/[0.06] sm:p-5"
            >
              <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
              <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-violet-500/10 blur-2xl" />

              {editingId === l.id ? (
                <div className="relative flex flex-col gap-3">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs text-white/65 sm:text-sm">
                        Nombre
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition focus:border-fuchsia-400/40 focus:bg-white/[0.06] sm:py-3"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs text-white/65 sm:text-sm">
                        Número
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition focus:border-fuchsia-400/40 focus:bg-white/[0.06] sm:py-3"
                        value={editNumber}
                        onChange={(e) => setEditNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(l.id)}
                      className="rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(217,70,239,0.22)] transition hover:scale-[1.02]"
                    >
                      {loadingId === l.id ? "Guardando..." : "Guardar"}
                    </button>

                    <button
                      onClick={cancelEdit}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-white sm:text-lg">
                      {l.name}
                    </div>
                    <div className="mt-1 truncate text-sm text-white/55">
                      {l.number}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(l)}
                      className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/75 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => removeLine(l.id)}
                      className="rounded-full border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm text-red-300 transition hover:bg-red-500/20"
                    >
                      {loadingId === l.id ? "Borrando..." : "Borrar"}
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
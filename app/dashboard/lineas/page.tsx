"use client";

import { useEffect, useState } from "react";

type Line = {
  id: string;
  name: string;
  number: string;
};

export default function LineasPage() {
  const [lines, setLines] = useState<Line[]>([]);
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
  }

  useEffect(() => {
    load();
  }, []);

  // =========================
  // AGREGAR
  // =========================
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

  // =========================
  // BORRAR
  // =========================
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

  // =========================
  // EDITAR
  // =========================
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Líneas</h1>
        <p className="text-sm text-white/60">Tus números de WhatsApp para atención</p>
      </div>

      {/* AGREGAR */}
      <div className="flex gap-2">
        <input
          className="rounded-lg bg-black border border-white/10 px-3 py-2 text-sm"
          placeholder="Nombre (Ej: Morena)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="rounded-lg bg-black border border-white/10 px-3 py-2 text-sm"
          placeholder="Número (Ej: +54911...)"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <button
          onClick={addLine}
          disabled={loadingAdd}
          className="rounded-lg bg-fuchsia-600 px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {loadingAdd ? "..." : "Agregar"}
        </button>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* LISTA */}
      <div className="space-y-3">
        {lines.map((l) => (
          <div
            key={l.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3"
          >
            {editingId === l.id ? (
              <div className="flex w-full items-center justify-between gap-3">
                <div className="flex gap-2 w-full">
                  <input
                    className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-sm"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                  <input
                    className="w-full rounded-lg bg-black border border-white/10 px-3 py-2 text-sm"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => saveEdit(l.id)}
                    disabled={loadingId === l.id}
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs disabled:opacity-60"
                  >
                    {loadingId === l.id ? "..." : "Guardar"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="font-medium">{l.name}</div>
                  <div className="text-sm text-white/60">{l.number}</div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(l)}
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => removeLine(l.id)}
                    disabled={loadingId === l.id}
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs disabled:opacity-60"
                  >
                    {loadingId === l.id ? "..." : "Borrar"}
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

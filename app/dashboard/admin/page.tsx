"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  maxLines: number;
  landingKey?: string | null;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [landingKey, setLandingKey] = useState("");
  const [maxLines, setMaxLines] = useState("1");
  const [creating, setCreating] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setUsers(data.users || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateMaxLines(id: string, value: number) {
    if (value < 1) return;

    setError("");
    setLoadingId(id);

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxLines: value }),
    });

    const data = await res.json().catch(() => ({}));
    setLoadingId(null);

    if (!res.ok) {
      setError(data?.error || "Error");
      return;
    }

    await load();
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        landingKey,
        maxLines: Number(maxLines),
      }),
    });

    const data = await res.json().catch(() => ({}));
    setCreating(false);

    if (!res.ok) {
      setError(data?.error || "Error creando usuario");
      return;
    }

    setEmail("");
    setPassword("");
    setLandingKey("");
    setMaxLines("1");

    await load();
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Panel Master</h1>
        <p className="text-sm text-white/60">
          Administrá usuarios y cantidad de líneas por plan.
        </p>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <form
        onSubmit={createUser}
        className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4"
      >
        <h2 className="text-sm font-medium">Crear nuevo usuario</h2>

        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
          />

          <input
            type="text"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
          />

          <input
            type="text"
            placeholder="landingKey (ej: virgi)"
            value={landingKey}
            onChange={(e) => setLandingKey(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
          />

          <input
            type="number"
            min="1"
            placeholder="maxLines"
            value={maxLines}
            onChange={(e) => setMaxLines(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={creating}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-60"
        >
          {creating ? "Creando..." : "Crear usuario"}
        </button>
      </form>

      {users.length === 0 ? (
        <p className="text-sm text-white/60">No hay usuarios todavía.</p>
      ) : (
        users.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <div>
              <div className="font-medium">{u.email}</div>
              <div className="text-sm text-white/60">
                Líneas permitidas: {u.maxLines}
              </div>
              <div className="text-sm text-white/60">
                landingKey: {u.landingKey || "—"}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateMaxLines(u.id, u.maxLines - 1)}
                disabled={loadingId === u.id}
                className="rounded-lg border border-white/10 px-3 py-1 text-xs cursor-pointer hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                -1
              </button>
              <button
                onClick={() => updateMaxLines(u.id, u.maxLines + 1)}
                disabled={loadingId === u.id}
                className="rounded-lg border border-white/10 px-3 py-1 text-xs cursor-pointer hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                +1
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
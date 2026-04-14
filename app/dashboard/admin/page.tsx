"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  maxLines: number;
  landingKey?: string | null;
  pixelId?: string | null;
  capiToken?: string | null;
};

type Vip = {
  id: string;
  name: string;
  phone: string;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [vip, setVip] = useState<Vip[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [landingKey, setLandingKey] = useState("");
  const [maxLines, setMaxLines] = useState("1");
  const [creating, setCreating] = useState(false);

  const [pixelInputs, setPixelInputs] = useState<Record<string, string>>({});
  const [tokenInputs, setTokenInputs] = useState<Record<string, string>>({});

  async function load() {
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setUsers(data.users || []);

    const pixelMap: Record<string, string> = {};
    const tokenMap: Record<string, string> = {};

    (data.users || []).forEach((u: User) => {
      pixelMap[u.id] = u.pixelId || "";
      tokenMap[u.id] = u.capiToken || "";
    });

    setPixelInputs(pixelMap);
    setTokenInputs(tokenMap);
  }

  async function loadVip() {
    const res = await fetch("/api/vip/list", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setVip(data.vip || []);
  }

  useEffect(() => {
    load();
    loadVip();
  }, []);

  async function updateUser(id: string, data: any) {
    setLoadingId(id);

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json().catch(() => ({}));
    setLoadingId(null);

    if (!res.ok) {
      setError(json?.error || "Error");
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
          Administrá usuarios y configuración avanzada.
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
            placeholder="landingKey opcional"
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

      {users.map((u) => (
        <div
          key={u.id}
          className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="font-medium">{u.email}</div>

          <div className="text-sm text-white/60">
            landingKey: {u.landingKey || "—"}
          </div>

          <div className="text-sm text-white/60">
            Líneas: {u.maxLines}
          </div>

          <div className="grid gap-2">
            <input
              placeholder="Pixel ID"
              value={pixelInputs[u.id] || ""}
              onChange={(e) =>
                setPixelInputs({ ...pixelInputs, [u.id]: e.target.value })
              }
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs"
            />

            <input
              placeholder="CAPI Token"
              value={tokenInputs[u.id] || ""}
              onChange={(e) =>
                setTokenInputs({ ...tokenInputs, [u.id]: e.target.value })
              }
              className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs"
            />

            <button
              onClick={() =>
                updateUser(u.id, {
                  pixelId: pixelInputs[u.id],
                  capiToken: tokenInputs[u.id],
                })
              }
              disabled={loadingId === u.id}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs hover:bg-white/10"
            >
              Guardar Pixel
            </button>
          </div>
        </div>
      ))}

      <div className="pt-6">
        <h2 className="text-sm font-medium mb-2">Jugadores VIP</h2>

        {vip.length === 0 ? (
          <p className="text-sm text-white/60">Sin jugadores aún</p>
        ) : (
          <div className="space-y-2">
            {vip.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3"
              >
                <div className="text-sm">{p.name}</div>
                <div className="text-xs text-white/60">{p.phone}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
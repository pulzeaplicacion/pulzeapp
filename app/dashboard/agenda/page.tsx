"use client";

import { useEffect, useMemo, useState } from "react";

type Player = {
  id: string;
  name: string;
  phone: string;
};

type MeResponse = {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");

  function getStorageKey(currentUserId: string) {
    return `agenda_players_${currentUserId}`;
  }

  function load(currentUserId: string) {
    const saved = localStorage.getItem(getStorageKey(currentUserId));
    if (saved) {
      setPlayers(JSON.parse(saved));
    } else {
      setPlayers([]);
    }
  }

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/me");
      const data: MeResponse = await res.json().catch(() => ({}));

      if (!res.ok || !data?.user?.id) return;

      setUserId(data.user.id);
      load(data.user.id);
    }

    init();
  }, []);

  function save(list: Player[], currentUserId: string) {
    localStorage.setItem(getStorageKey(currentUserId), JSON.stringify(list));
    setPlayers(list);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !phone.trim() || !userId) return;

    setLoading(true);

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
    };

    const updated = [newPlayer, ...players];
    save(updated, userId);

    fetch("/api/vip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newPlayer.name,
        phone: newPlayer.phone,
      }),
    });

    setName("");
    setPhone("");
    setLoading(false);
  }

  function handleDelete(id: string) {
    if (!userId) return;
    const updated = players.filter((p) => p.id !== id);
    save(updated, userId);
  }

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return players;

    return players.filter((p) => {
      return (
        p.name.toLowerCase().includes(term) ||
        p.phone.toLowerCase().includes(term)
      );
    });
  }, [players, search]);

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
            Agenda
          </div>

          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-none sm:mt-4 sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
              Backup premium de tus
            </span>{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              jugadores VIP
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-xs text-white/55 sm:mt-4 sm:text-sm md:text-base">
            Guardá contactos importantes y mantené una agenda limpia para futuras
            acciones y seguimiento.
          </p>
        </div>

        <form
          onSubmit={handleAdd}
          className="relative overflow-hidden rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_0_28px_rgba(217,70,239,0.06)] backdrop-blur-xl sm:p-5"
        >
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />
          <div className="pointer-events-none absolute -top-10 left-1/2 h-20 w-20 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_14px_rgba(217,70,239,0.8)]" />
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Guardar jugador
              </h2>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <div>
                <label className="mb-1.5 block text-xs text-white/65 sm:text-sm">
                  Nombre o apodo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06] sm:py-3"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs text-white/65 sm:text-sm">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06] sm:py-3"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-[0_0_18px_rgba(217,70,239,0.22)] transition hover:scale-[1.02] hover:shadow-[0_0_26px_rgba(217,70,239,0.28)] disabled:opacity-50 md:w-auto"
                >
                  {loading ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div className="mt-8 sm:mt-10">
          <div className="mb-3 flex items-center gap-3 sm:mb-4">
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.8)]" />
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Jugadores
            </h2>
          </div>

          <div className="mb-4">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan-400/30 focus:bg-white/[0.06] sm:py-3"
              placeholder="Buscar por nombre o teléfono"
            />
          </div>

          {filteredPlayers.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/55 backdrop-blur-xl sm:p-5">
              {players.length === 0
                ? "No hay jugadores guardados todavía."
                : "No se encontraron jugadores con esa búsqueda."}
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {filteredPlayers.map((p) => (
                <div
                  key={p.id}
                  className="relative overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 shadow-[0_0_18px_rgba(168,85,247,0.06)] backdrop-blur-xl transition hover:bg-white/[0.06] sm:p-5"
                >
                  <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
                  <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-violet-500/10 blur-2xl" />

                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-base font-semibold text-white sm:text-lg">
                        {p.name}
                      </div>
                      <div className="mt-1 truncate text-sm text-white/55">
                        {p.phone}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="shrink-0 rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-[11px] text-red-300 transition hover:bg-red-500/20"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
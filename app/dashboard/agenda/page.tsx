"use client";

import { useEffect, useState } from "react";

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

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-140px] h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-fuchsia-600/25 blur-[120px]" />
        <div className="absolute left-[10%] top-[25%] h-[240px] w-[240px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute bottom-[5%] right-[8%] h-[260px] w-[260px] rounded-full bg-pink-500/10 blur-[130px]" />
      </div>

      <div className="relative z-10">
        <div className="mb-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/45 backdrop-blur-sm">
            Agenda
          </div>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-none md:text-5xl">
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
              Backup premium de tus
            </span>{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              jugadores VIP
            </span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm text-white/55 md:text-base">
            Guardá contactos importantes y mantené una agenda limpia de
            jugadores valiosos para futuras acciones y seguimiento.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
          <form
            onSubmit={handleAdd}
            className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(217,70,239,0.08)] backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-fuchsia-400 shadow-[0_0_20px_rgba(217,70,239,0.9)]" />
              <h2 className="text-xl font-semibold text-white">
                Agregar jugador
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm text-white/65">
                  Nombre o apodo
                </label>
                <input
                  type="text"
                  placeholder="Ej: Mati slots"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/65">
                  Teléfono
                </label>
                <input
                  type="text"
                  placeholder="Ej: 3492123456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-5 py-3 text-sm font-medium text-white shadow-[0_0_25px_rgba(217,70,239,0.25)] transition hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(217,70,239,0.35)] disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar jugador"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_50px_rgba(139,92,246,0.08)] backdrop-blur-xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.9)]" />
              <h2 className="text-xl font-semibold text-white">Resumen</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-white/60">Jugadores guardados</span>
                <span className="text-white">{players.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Estado</span>
                <span className="text-emerald-400">
                  {players.length > 0 ? "Activo" : "Vacío"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-white/60">Backup local</span>
                <span className="text-white">OK</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.9)]" />
            <h2 className="text-xl font-semibold text-white">Jugadores</h2>
          </div>

          {players.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 text-white/55 backdrop-blur-xl">
              No hay jugadores guardados todavía.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {players.map((p) => (
                <div
                  key={p.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-[0_0_40px_rgba(168,85,247,0.08)] backdrop-blur-xl transition hover:bg-white/[0.06]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-white">
                        {p.name}
                      </div>
                      <div className="mt-1 text-sm text-white/55">
                        {p.phone}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(p.id)}
                      className="rounded-full border border-red-400/20 bg-red-500/10 px-3 py-1 text-xs text-red-300 transition hover:bg-red-500/20"
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
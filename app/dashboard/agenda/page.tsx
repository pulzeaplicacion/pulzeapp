"use client";

import { useEffect, useState } from "react";

type Player = {
  id: string;
  name: string;
  phone: string;
};

export default function Page() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  function load() {
    const saved = localStorage.getItem("agenda_players");
    if (saved) {
      setPlayers(JSON.parse(saved));
    }
  }

  useEffect(() => {
    load();
  }, []);

  function save(list: Player[]) {
    localStorage.setItem("agenda_players", JSON.stringify(list));
    setPlayers(list);
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) return;

    const newPlayer: Player = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
    };

    const updated = [newPlayer, ...players];
    save(updated);

    setName("");
    setPhone("");
  }

  function handleDelete(id: string) {
    const updated = players.filter((p) => p.id !== id);
    save(updated);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Agenda</h1>
        <p className="mt-2 text-white/60">
          Backup de jugadores buenos
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4"
      >
        <h2 className="text-sm font-medium">Agregar jugador</h2>

        <input
          type="text"
          placeholder="Nombre o apodo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
        />

        <input
          type="text"
          placeholder="Teléfono"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
        />

        <button
          type="submit"
          className="rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/10"
        >
          Guardar jugador
        </button>
      </form>

      <div className="space-y-3">
        {players.length === 0 ? (
          <p className="text-sm text-white/60">
            No hay jugadores guardados todavía.
          </p>
        ) : (
          players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-white/60">{p.phone}</div>
              </div>

              <button
                onClick={() => handleDelete(p.id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
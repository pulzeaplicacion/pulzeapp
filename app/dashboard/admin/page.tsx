"use client";

import { useEffect, useState } from "react";

type User = {
  id: string;
  email: string;
  maxLines: number;
};

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);

  async function load() {
    const res = await fetch("/api/admin/users");
    const data = await res.json().catch(() => ({}));
    setUsers(data.users || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateMaxLines(id: string, value: number) {
    if (value < 1) return;

    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ maxLines: value }),
    });

    await load();
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Panel Master</h1>

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
                Líneas: {u.maxLines}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => updateMaxLines(u.id, u.maxLines - 1)}
                className="rounded-lg border border-white/10 px-3 py-1 text-xs cursor-pointer hover:bg-white/10"
              >
                -1
              </button>
              <button
                onClick={() => updateMaxLines(u.id, u.maxLines + 1)}
                className="rounded-lg border border-white/10 px-3 py-1 text-xs cursor-pointer hover:bg-white/10"
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
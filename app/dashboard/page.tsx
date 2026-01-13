"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Me = { user: { email: string; role: string } };

export default function Page() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setMe(data));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-white/60">Panel base – Fase 1</p>

          <div className="mt-3 text-sm text-white/60">
            {me ? (
              <>
                Logueado como: <span className="text-white">{me.user.email}</span>{" "}
                · Rol: <span className="text-white">{me.user.role}</span>
              </>
            ) : (
              "Cargando usuario…"
            )}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
        >
          Salir
        </button>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Visitas</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Clicks WhatsApp</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/60">Confirmados</p>
          <p className="mt-2 text-3xl font-semibold">—</p>
        </div>
      </div>
    </div>
  );
}

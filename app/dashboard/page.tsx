"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const ok = localStorage.getItem("landzy_auth") === "1";
    if (!ok) router.replace("/login");
  }, [router]);

  function handleLogout() {
    localStorage.removeItem("landzy_auth");
    router.replace("/login");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-white/60">Panel base – Fase 1</p>
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

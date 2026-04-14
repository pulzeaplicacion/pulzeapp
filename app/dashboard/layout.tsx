"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function NavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "group block rounded-2xl px-4 py-3 text-sm transition-all duration-200",
        active
          ? "border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-[0_0_30px_rgba(217,70,239,0.22)]"
          : "border border-transparent bg-white/[0.03] text-white/70 hover:border-white/10 hover:bg-white/[0.06] hover:text-white",
      ].join(" ")}
    >
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span
          className={[
            "h-2 w-2 rounded-full transition",
            active
              ? "bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]"
              : "bg-white/15 group-hover:bg-fuchsia-300/60",
          ].join(" ")}
        />
      </span>
    </Link>
  );
}

type MeResponse = {
  user?: {
    email: string;
    role: string;
  };
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [me, setMe] = useState<MeResponse | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setMe(data))
      .catch(() => {});
  }, []);

  const isAdmin = me?.user?.role === "admin";

  return (
    <div className="min-h-screen bg-transparent text-white">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="relative w-72 border-r border-white/10 bg-black/30 p-5 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-[-120px] h-[220px] w-[220px] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-[100px]" />
            <div className="absolute left-[10%] top-[35%] h-[180px] w-[180px] rounded-full bg-violet-600/10 blur-[90px]" />
          </div>

          <div className="relative z-10 flex h-full flex-col">
            <div>
              
              <h2 className="mt-4 text-3xl font-semibold leading-none text-white">
  PULZE
</h2>

              <p className="mt-3 text-sm text-white/45">
                Panel premium de gestión y conversiones.
              </p>
            </div>

            <nav className="mt-8 space-y-2">
              <NavItem href="/dashboard" label="Dashboard" />
              <NavItem href="/dashboard/conversiones" label="Conversiones" />
              <NavItem href="/dashboard/agenda" label="Agenda" />
              <NavItem href="/dashboard/lineas" label="Líneas" />
              {isAdmin && <NavItem href="/dashboard/admin" label="Panel Master" />}
            </nav>

            <div className="mt-auto rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_0_40px_rgba(168,85,247,0.08)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">
                Sesión
              </p>

              <div className="mt-3">
                <div className="text-sm font-medium text-white">
                  {me?.user?.email || "Cargando..."}
                </div>
                <div className="mt-1 text-sm text-white/50">
                  Rol: {me?.user?.role || "—"}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Contenido */}
        <main className="flex-1 p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
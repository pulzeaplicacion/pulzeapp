"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function NavItem({
  href,
  label,
  mobile = false,
  onClick,
}: {
  href: string;
  label: string;
  mobile?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={[
        "group block transition-all duration-200",
        mobile
          ? [
              "rounded-xl px-3 py-2.5 text-sm",
              active
                ? "border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-[0_0_24px_rgba(217,70,239,0.2)]"
                : "border border-white/10 bg-white/[0.03] text-white/75 hover:bg-white/[0.06]",
            ].join(" ")
          : [
              "rounded-2xl px-4 py-3 text-sm",
              active
                ? "border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-[0_0_30px_rgba(217,70,239,0.22)]"
                : "border border-transparent bg-white/[0.03] text-white/70 hover:border-white/10 hover:bg-white/[0.06] hover:text-white",
            ].join(" "),
      ].join(" ")}
    >
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span
          className={[
            mobile ? "h-1.5 w-1.5" : "h-2 w-2",
            "rounded-full transition",
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
  const [mobileOpen, setMobileOpen] = useState(false);

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
        {/* Sidebar desktop */}
        <aside className="relative hidden w-72 border-r border-white/10 bg-black/30 p-5 backdrop-blur-2xl lg:block">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-[-120px] h-[220px] w-[220px] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-[100px]" />
            <div className="absolute left-[10%] top-[35%] h-[180px] w-[180px] rounded-full bg-violet-600/10 blur-[90px]" />
          </div>

          <div className="relative z-10 flex h-full flex-col">
            <div>
              <h2 className="mt-2 text-3xl font-semibold leading-none text-white">
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

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile topbar */}
          <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-xl lg:hidden">
            <div className="flex items-center justify-between px-3 py-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/85"
                aria-label="Abrir menú"
              >
                <span className="flex flex-col gap-[3px]">
                  <span className="block h-[2px] w-4 rounded-full bg-white" />
                  <span className="block h-[2px] w-4 rounded-full bg-white" />
                  <span className="block h-[2px] w-4 rounded-full bg-white" />
                </span>
              </button>

              <div className="text-xl font-semibold leading-none text-white">
                PULZE
              </div>
            </div>
          </header>

          {/* Mobile overlay */}
          {mobileOpen && (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}

          {/* Mobile drawer */}
          <aside
            className={[
              "fixed left-0 top-0 z-[60] flex h-full w-[82%] max-w-[290px] flex-col border-r border-white/10 bg-[#08070d]/95 p-4 backdrop-blur-2xl transition-transform duration-300 lg:hidden",
              mobileOpen ? "translate-x-0" : "-translate-x-full",
            ].join(" ")}
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-1/2 top-[-80px] h-[180px] w-[180px] -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-[90px]" />
              <div className="absolute left-[10%] top-[35%] h-[140px] w-[140px] rounded-full bg-violet-600/10 blur-[80px]" />
            </div>

            <div className="relative z-10 flex h-full flex-col">
              <div className="mb-5 flex items-center justify-between">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-white/85"
                  aria-label="Cerrar menú"
                >
                  ✕
                </button>

                <div className="text-lg font-semibold text-white">Menú</div>
              </div>

              <nav className="space-y-2">
                <NavItem
                  href="/dashboard"
                  label="Dashboard"
                  mobile
                  onClick={() => setMobileOpen(false)}
                />
                <NavItem
                  href="/dashboard/conversiones"
                  label="Conversiones"
                  mobile
                  onClick={() => setMobileOpen(false)}
                />
                <NavItem
                  href="/dashboard/agenda"
                  label="Agenda"
                  mobile
                  onClick={() => setMobileOpen(false)}
                />
                <NavItem
                  href="/dashboard/lineas"
                  label="Líneas"
                  mobile
                  onClick={() => setMobileOpen(false)}
                />
                {isAdmin && (
                  <NavItem
                    href="/dashboard/admin"
                    label="Panel Master"
                    mobile
                    onClick={() => setMobileOpen(false)}
                  />
                )}
              </nav>

              <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-[0_0_30px_rgba(168,85,247,0.08)]">
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                  Sesión
                </p>

                <div className="mt-2">
                  <div className="text-sm font-medium text-white break-all">
                    {me?.user?.email || "Cargando..."}
                  </div>
                  <div className="mt-1 text-sm text-white/50">
                    Rol: {me?.user?.role || "—"}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1 p-3 sm:p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
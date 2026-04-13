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
        "block rounded-lg px-3 py-2 transition",
        active ? "bg-white/10 border border-white/10" : "hover:bg-white/5",
      ].join(" ")}
    >
      {label}
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
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black p-4">
        <h2 className="text-lg font-semibold">PULZE</h2>

        <nav className="mt-6 space-y-2 text-sm">
          <NavItem href="/dashboard" label="Dashboard" />
          <NavItem href="/dashboard/conversiones" label="Conversiones" />
          <NavItem href="/dashboard/agenda" label="Agenda" />
          <NavItem href="/dashboard/lineas" label="Líneas" />
          {isAdmin && <NavItem href="/dashboard/admin" label="Panel Master" />}
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
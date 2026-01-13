export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-black text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black p-4">
        <h2 className="text-lg font-semibold">Panel</h2>

       <nav className="mt-6 space-y-2 text-sm">
  <a href="/dashboard" className="block rounded-lg px-3 py-2 hover:bg-white/5">
    Dashboard
  </a>
  <a href="/dashboard/conversiones" className="block rounded-lg px-3 py-2 hover:bg-white/5">
    Conversiones
  </a>
  <a href="/dashboard/agenda" className="block rounded-lg px-3 py-2 hover:bg-white/5">
    Agenda
  </a>
  <a href="/dashboard/lineas" className="block rounded-lg px-3 py-2 hover:bg-white/5">
    Líneas
  </a>
</nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
}

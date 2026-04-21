"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al iniciar sesión");
        return;
      }

      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al iniciar sesión");
    }
  }

  return (
    <main className="pulze-bg relative flex min-h-screen items-center justify-center overflow-hidden px-3">
      {/* Glow fondo */}
      <div className="pointer-events-none absolute left-[-80px] top-[-80px] h-32 w-32 rounded-full bg-fuchsia-600/20 blur-3xl sm:h-56 sm:w-56" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[-80px] h-40 w-40 rounded-full bg-violet-600/20 blur-3xl sm:h-64 sm:w-64" />

      <div className="relative z-10 w-full max-w-[270px] sm:max-w-md">
        <div className="rounded-[20px] border border-white/10 bg-white/5 p-2.5 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.10)] sm:rounded-[22px] sm:p-6">
          {/* Header */}
          <div className="mb-3 text-center sm:mb-6">
            <img
              src="/logo.png"
              alt="Pulze"
              className="mx-auto mb-1.5 h-14 object-contain sm:mb-2 sm:h-16"
            />

            <p className="mt-0.5 text-[10px] text-white/60 sm:mt-1 sm:text-[13px]">
              Acceso al panel
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-2 rounded-xl border border-fuchsia-500/30 bg-black/30 p-2.5 shadow-[0_0_25px_rgba(217,70,239,0.12)] sm:space-y-2.5 sm:rounded-2xl sm:p-3"
          >
            <div>
              <label className="mb-1 block text-[10px] font-medium text-white/80">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-[12px] text-white outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 sm:px-3 sm:py-2 sm:text-[13px]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-medium text-white/80">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-white/15 bg-black/40 px-2.5 py-1.5 text-[12px] text-white outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30 sm:px-3 sm:py-2 sm:text-[13px]"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="mt-1.5 w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 py-1.5 text-[12px] font-semibold text-white shadow-lg shadow-fuchsia-900/40 transition hover:scale-[1.02] active:scale-[0.98] sm:mt-2 sm:py-2 sm:text-[13px]"
            >
              Ingresar
            </button>
          </form>

          <div className="mt-2.5 text-center sm:mt-3">
            <p className="text-[9px] text-white/35 sm:text-[10px]">
              Panel interno
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
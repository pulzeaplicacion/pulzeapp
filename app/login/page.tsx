"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        alert("Credenciales inválidas");
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
      <div className="pointer-events-none absolute left-[-80px] top-[-80px] h-40 w-40 rounded-full bg-fuchsia-600/20 blur-3xl sm:h-56 sm:w-56" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[-80px] h-48 w-48 rounded-full bg-violet-600/20 blur-3xl sm:h-64 sm:w-64" />

      <div className="relative z-10 w-full max-w-[300px] sm:max-w-md">
        <div className="rounded-[22px] border border-white/10 bg-white/5 p-3 backdrop-blur-2xl shadow-[0_0_30px_rgba(168,85,247,0.10)] sm:p-6">
          
          <div className="mb-4 text-center sm:mb-6">
  <img
    src="/logo.svg"
    alt="Pulze"
    className="mx-auto mb-3 h-16 object-contain sm:h-14"
  />

  <p className="mt-1 text-[11px] text-white/60 sm:text-[13px]">
    Acceso al panel
  </p>
</div>
          {/* FORM DESTACADO */}
          <form
            onSubmit={handleSubmit}
            className="space-y-2.5 rounded-2xl border border-fuchsia-500/30 bg-black/30 p-3 shadow-[0_0_25px_rgba(217,70,239,0.12)]"
          >
            {/* Email */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-white/80">
                Email
              </label>
              <input
                type="email"
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-white outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-[10px] font-medium text-white/80">
                Contraseña
              </label>
              <input
                type="password"
                className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-[13px] text-white outline-none transition focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Botón */}
            <button
              type="submit"
              className="mt-2 w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-violet-600 py-2 text-[13px] font-semibold text-white shadow-lg shadow-fuchsia-900/40 transition hover:scale-[1.02] active:scale-[0.98]"
            >
              Ingresar
            </button>
          </form>

          {/* Footer */}
          <div className="mt-3 text-center">
            <p className="text-[10px] text-white/35">
              Panel interno
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
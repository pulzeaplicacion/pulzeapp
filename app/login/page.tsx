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
    <main className="pulze-bg relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      {/* Glow decorativo */}
      <div className="pointer-events-none absolute left-[-80px] top-[-80px] h-56 w-56 rounded-full bg-fuchsia-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-100px] right-[-80px] h-64 w-64 rounded-full bg-violet-600/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-2xl shadow-[0_0_40px_rgba(168,85,247,0.12)] sm:p-6">
          <div className="mb-6">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-600 to-violet-600 text-sm font-semibold text-white shadow-lg shadow-fuchsia-950/30">
              P
            </div>

            <h1 className="text-[24px] font-semibold tracking-tight text-white sm:text-[28px]">
              Bienvenido a PULZE
            </h1>

            <p className="mt-2 text-[12px] text-white/55 sm:text-[13px]">
              Ingresá a tu panel para gestionar conversiones, agenda y líneas.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/65">
                Email
              </label>
              <input
                type="email"
                className="pulze-input"
                placeholder="tuemail@pulze.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium text-white/65">
                Contraseña
              </label>
              <input
                type="password"
                className="pulze-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="pulze-btn mt-2 w-full">
              Ingresar al panel
            </button>
          </form>

          <div className="mt-5 border-t border-white/10 pt-4">
            <p className="text-center text-[11px] text-white/35">
              PULZE · Conversiones para operación interna
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
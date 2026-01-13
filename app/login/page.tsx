"use client";

import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  function handleLogin() {
    localStorage.setItem("landzy_auth", "1");
    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-1 text-sm text-white/60">Entrá a tu panel</p>

        <div className="mt-6 space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-white/30"
          />

          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 transition px-4 py-2 font-medium"
          >
            Entrar
          </button>
        </div>

        <p className="mt-4 text-xs text-white/40">
          Login temporal (Fase 1)
        </p>
      </div>
    </main>
  );
}

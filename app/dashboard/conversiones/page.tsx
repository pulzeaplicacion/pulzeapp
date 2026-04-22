"use client";

import { useEffect, useMemo, useState } from "react";

type PendingItem = {
  id: string;
  code: string;
  userId: string;
  lineId: string;
  line?: {
    name: string;
    number: string;
  };
  status: string;
  playerName: string | null;
  amount: number | null;
  confirmedAt: string | null;
  createdAt: string;
};

type MeResponse = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

type AgendaPlayer = {
  id: string;
  name: string;
  phone: string;
};

export default function Page() {
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingCode, setConfirmingCode] = useState("");
  const [rejectingCode, setRejectingCode] = useState("");
  const [selectedCode, setSelectedCode] = useState("");
  const [rejectCode, setRejectCode] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [filter, setFilter] = useState("all");
  const [userId, setUserId] = useState("");

  function getAgendaStorageKey(currentUserId: string) {
    return `agenda_players_${currentUserId}`;
  }

  function savePlayerToAgendaLocal(
    currentUserId: string,
    name: string,
    phone: string
  ) {
    if (!currentUserId) return;

    const storageKey = getAgendaStorageKey(currentUserId);
    const saved = localStorage.getItem(storageKey);

    let players: AgendaPlayer[] = [];

    if (saved) {
      try {
        players = JSON.parse(saved);
      } catch {
        players = [];
      }
    }

    const newPlayer: AgendaPlayer = {
      id: crypto.randomUUID(),
      name: name.trim(),
      phone: phone.trim(),
    };

    const updated = [newPlayer, ...players];
    localStorage.setItem(storageKey, JSON.stringify(updated));
  }

  async function savePlayerToMaster(name: string, phone: string) {
    await fetch("/api/vip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        phone: phone.trim(),
      }),
    });
  }

  async function loadPending(currentUserId?: string) {
    try {
      const finalUserId = currentUserId || userId;
      if (!finalUserId) return;

      const res = await fetch(`/api/pending/${finalUserId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error cargando pendientes");
      }

      setPending(data.pending || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error interno");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function init() {
      try {
        const meRes = await fetch("/api/me");
        const meData: MeResponse = await meRes.json();

        if (!meRes.ok || !meData?.user?.id) {
          throw new Error("No se pudo obtener el usuario");
        }

        setUserId(meData.user.id);
        await loadPending(meData.user.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error interno");
        setLoading(false);
      }
    }

    init();
  }, []);

  function openConfirmModal(code: string) {
    setSelectedCode(code);
    setPlayerName("");
    setAmount("");
    setPhone("");
  }

  function closeConfirmModal() {
    setSelectedCode("");
    setPlayerName("");
    setAmount("");
    setPhone("");
  }

  function openRejectModal(code: string) {
    setRejectCode(code);
  }

  function closeRejectModal() {
    setRejectCode("");
  }

  async function handleConfirm() {
    try {
      if (!selectedCode) return;

      if (!playerName.trim()) {
        alert("Tenés que ingresar el jugador o apodo.");
        return;
      }

      if (!amount.trim()) {
        alert("Tenés que ingresar el monto.");
        return;
      }

      if (!phone.trim()) {
        alert("Tenés que ingresar el teléfono.");
        return;
      }

      setConfirmingCode(selectedCode);

      const res = await fetch("/api/pending/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: selectedCode,
          playerName: playerName.trim(),
          amount,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error confirmando");
      }

      savePlayerToAgendaLocal(userId, playerName, phone);
      await savePlayerToMaster(playerName, phone);

      closeConfirmModal();
      await loadPending();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error interno");
    } finally {
      setConfirmingCode("");
    }
  }

  async function handleReject(code: string) {
    try {
      setRejectingCode(code);

      const res = await fetch("/api/pending/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Error rechazando");
      }

      closeRejectModal();
      await loadPending();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error interno");
    } finally {
      setRejectingCode("");
    }
  }

  function isInFilter(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();

    if (filter === "today") {
      return date.toDateString() === now.toDateString();
    }

    if (filter === "yesterday") {
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      return date.toDateString() === yesterday.toDateString();
    }

    if (filter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    }

    return true;
  }

  function formatDateTimeWithSeconds(dateString: string) {
    return new Date(dateString).toLocaleString("es-AR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  const filtered = useMemo(
    () => pending.filter((p) => isInFilter(p.createdAt)),
    [pending, filter]
  );

  const pendientes = filtered.filter((p) => p.status !== "confirmed");
  const confirmados = filtered.filter((p) => p.status === "confirmed");

  const total = confirmados.reduce((acc, item) => acc + (item.amount || 0), 0);
  const jugadores = confirmados.length;
  const promedio = jugadores > 0 ? total / jugadores : 0;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05030a] text-white">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 8%, rgba(168,85,247,0.18), transparent 28%),
            radial-gradient(circle at 14% 30%, rgba(139,92,246,0.10), transparent 22%),
            radial-gradient(circle at 86% 76%, rgba(236,72,153,0.08), transparent 24%)
          `,
        }}
      />

      <div className="relative z-10 px-3 pt-5 pb-8 sm:px-4 sm:pt-6 sm:pb-10 lg:px-6">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/45 backdrop-blur-sm sm:text-[11px]">
            Conversiones
          </div>

          <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-none sm:mt-4 sm:text-4xl md:text-5xl">
            <span className="bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
              Controlá tus
            </span>{" "}
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              conversiones
            </span>
          </h1>

          <p className="mt-3 max-w-2xl text-xs text-white/55 sm:mt-4 sm:text-sm md:text-base">
            Seguimiento de bonos, pendientes y confirmados con una vista más
            limpia para operar rápido.
          </p>
        </div>

        <div className="mb-5 flex flex-wrap gap-2 sm:mb-6">
          {[
            { key: "all", label: "Todo" },
            { key: "today", label: "Hoy" },
            { key: "yesterday", label: "Ayer" },
            { key: "week", label: "7 días" },
          ].map((f) => {
            const active = filter === f.key;

            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={[
                  "rounded-full border px-3 py-1.5 text-xs transition-all duration-200 sm:px-4 sm:py-2 sm:text-sm",
                  active
                    ? "border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-500 to-violet-600 text-white shadow-[0_0_22px_rgba(192,38,211,0.22)]"
                    : "border-white/10 bg-white/[0.04] text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white",
                ].join(" ")}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 text-center backdrop-blur-xl shadow-[0_0_18px_rgba(168,85,247,0.06)] sm:p-4">
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-400/60 to-transparent" />
            <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-2xl" />

            <p className="relative text-lg font-semibold tracking-tight text-white sm:text-2xl">
              ${total.toLocaleString("es-AR")}
            </p>

            <p className="relative mt-2 text-[10px] leading-[1.15] text-white/50 sm:text-[11px]">
              Total
              <br />
              generado
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 text-center backdrop-blur-xl shadow-[0_0_18px_rgba(168,85,247,0.06)] sm:p-4">
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-pink-400/60 to-transparent" />
            <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-pink-500/10 blur-2xl" />

            <p className="relative text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {jugadores}
            </p>

            <p className="relative mt-2 text-[10px] leading-[1.15] text-white/50 sm:text-[11px]">
              Jugadores
            </p>
          </div>

          <div className="relative overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-3 text-center backdrop-blur-xl shadow-[0_0_18px_rgba(168,85,247,0.06)] sm:p-4">
            <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
            <div className="pointer-events-none absolute -top-8 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-2xl" />

            <p className="relative text-lg font-semibold tracking-tight text-white sm:text-2xl">
              ${Math.round(promedio).toLocaleString("es-AR")}
            </p>

            <p className="relative mt-2 text-[10px] leading-[1.15] text-white/50 sm:text-[11px]">
              Promedio
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mt-10">
          <div className="mb-3 flex items-center gap-3 sm:mb-4">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-[0_0_14px_rgba(250,204,21,0.8)]" />
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Pendientes
            </h2>
          </div>

          {loading && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/60 backdrop-blur-xl sm:p-5">
              Cargando pendientes...
            </div>
          )}

          {error && (
            <div className="rounded-3xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300 backdrop-blur-xl sm:p-5">
              {error}
            </div>
          )}

          {!loading && !error && pendientes.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/55 backdrop-blur-xl sm:p-5">
              No hay pendientes.
            </div>
          )}

          {!loading && !error && pendientes.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_0_28px_rgba(217,70,239,0.06)] backdrop-blur-xl">
              <div className="overflow-x-hidden">
                <table className="w-full table-fixed text-[11px] sm:text-sm">
                  <thead className="bg-white/[0.03] text-white/55">
                    <tr className="text-left">
                      <th className="w-[26%] px-2 py-2 font-medium sm:px-4 sm:py-3">
                        Bono
                      </th>
                      <th className="w-[18%] px-2 py-2 font-medium sm:px-4 sm:py-3">
                        Línea
                      </th>
                      <th className="w-[26%] px-2 py-2 font-medium sm:px-4 sm:py-3">
                        Fecha
                      </th>
                      <th className="w-[30%] px-2 py-2 font-medium sm:px-4 sm:py-3">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendientes.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-white/10 align-middle transition hover:bg-white/[0.03]"
                      >
                        <td className="px-2 py-2 sm:px-4 sm:py-3">
                          <span className="inline-flex max-w-full truncate rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold text-fuchsia-200 sm:px-3 sm:py-1 sm:text-xs">
                            {item.code}
                          </span>
                        </td>

                        <td className="truncate px-2 py-2 text-white/70 sm:px-4 sm:py-3">
                          {item.line?.name || item.lineId}
                        </td>

                        <td className="px-2 py-2 text-[10px] leading-tight text-white/55 sm:px-4 sm:py-3 sm:text-xs">
                          {formatDateTimeWithSeconds(item.createdAt)}
                        </td>

                        <td className="px-2 py-2 sm:px-4 sm:py-3">
                          <div className="flex flex-col gap-1 sm:flex-row">
                            <button
                              onClick={() => openConfirmModal(item.code)}
                              className="rounded-full border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-2 py-1 text-[10px] font-medium text-white shadow-[0_0_14px_rgba(217,70,239,0.18)] transition hover:scale-[1.02] sm:px-3 sm:py-1.5 sm:text-xs"
                            >
                              Confirmar
                            </button>

                            <button
                              onClick={() => openRejectModal(item.code)}
                              disabled={rejectingCode === item.code}
                              className="rounded-full border border-white/10 bg-white/[0.05] px-2 py-1 text-[10px] font-medium text-white/75 transition hover:bg-white/[0.08] hover:text-white disabled:opacity-50 sm:px-3 sm:py-1.5 sm:text-xs"
                            >
                              {rejectingCode === item.code
                                ? "Rechazando..."
                                : "Rechazar"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 sm:mt-12">
          <div className="mb-3 flex items-center gap-3 sm:mb-4">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.8)]" />
            <h2 className="text-lg font-semibold text-white sm:text-xl">
              Confirmados
            </h2>
          </div>

          {!loading && !error && confirmados.length === 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white/55 backdrop-blur-xl sm:p-5">
              No hay confirmados.
            </div>
          )}

          {!loading && !error && confirmados.length > 0 && (
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_0_28px_rgba(139,92,246,0.06)] backdrop-blur-xl">
              <div className="overflow-x-hidden">
                <table className="w-full table-fixed text-[11px] sm:text-sm">
                  <thead className="bg-white/[0.03] text-white/55">
                    <tr className="text-left">
                      <th className="w-[18%] px-2 py-2 font-medium sm:px-4 sm:py-3">
                        Bono
                      </th>
                      <th className="w-[18%] px-2 py-2 font-medium sm:px-4 sm:py-3">
                        Línea
                      </th>
                      <th className="w-[22%] px-2 py-2 font-medium sm:px-4 sm:py-3">
                        Jugador
                      </th>
                      <th className="w-[18%] px-2 py-2 font-medium sm:px-4 sm:py-3">
                        Monto
                      </th>
                      <th className="w-[24%] px-2 py-2 font-medium sm:px-4 sm:py-3">
                        Fecha
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {confirmados.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-white/10 transition hover:bg-white/[0.03]"
                      >
                        <td className="px-2 py-2 sm:px-4 sm:py-3">
                          <span className="inline-flex max-w-full truncate rounded-full border border-emerald-400/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 sm:px-3 sm:py-1 sm:text-xs">
                            {item.code}
                          </span>
                        </td>

                        <td className="truncate px-2 py-2 text-white/70 sm:px-4 sm:py-3">
                          {item.line?.name || item.lineId}
                        </td>

                        <td className="truncate px-2 py-2 text-white/70 sm:px-4 sm:py-3">
                          {item.playerName || "—"}
                        </td>

                        <td className="px-2 py-2 font-medium text-white sm:px-4 sm:py-3">
                          {item.amount
                            ? `$${item.amount.toLocaleString("es-AR")}`
                            : "—"}
                        </td>

                        <td className="px-2 py-2 text-[10px] leading-tight text-white/55 sm:px-4 sm:py-3 sm:text-xs">
                          {formatDateTimeWithSeconds(item.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a10] p-5 shadow-[0_0_60px_rgba(217,70,239,0.16)] sm:p-6">
            <div className="pointer-events-none absolute left-1/2 top-[-80px] h-40 w-40 -translate-x-1/2 rounded-full bg-fuchsia-600/25 blur-[80px]" />

            <div className="relative z-10">
              <div className="inline-flex rounded-full border border-fuchsia-400/20 bg-fuchsia-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-fuchsia-200 sm:text-[11px]">
                Confirmación
              </div>

              <h2 className="mt-4 text-xl font-semibold sm:text-2xl">
                Confirmar bono{" "}
                <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                  {selectedCode}
                </span>
              </h2>

              <div className="mt-5 sm:mt-6">
                <label className="mb-2 block text-sm text-white/65">
                  Jugador / Apodo
                </label>
                <input
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06]"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/65">
                  Monto
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06]"
                />
              </div>

              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/65">
                  Teléfono
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ej: 3411234567"
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none transition placeholder:text-white/25 focus:border-fuchsia-400/40 focus:bg-white/[0.06]"
                />
              </div>

              <div className="mt-5 flex gap-3 sm:mt-6">
                <button
                  onClick={closeConfirmModal}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white/75 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleConfirm}
                  disabled={confirmingCode === selectedCode}
                  className="w-full rounded-2xl border border-fuchsia-400/30 bg-gradient-to-r from-fuchsia-500 to-violet-600 px-4 py-3 font-medium text-white shadow-[0_0_24px_rgba(217,70,239,0.24)] transition hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(217,70,239,0.3)] disabled:opacity-50"
                >
                  {confirmingCode === selectedCode
                    ? "Confirmando..."
                    : "Confirmar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rejectCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0a10] p-5 shadow-[0_0_60px_rgba(217,70,239,0.16)] sm:p-6">
            <div className="pointer-events-none absolute left-1/2 top-[-80px] h-40 w-40 -translate-x-1/2 rounded-full bg-fuchsia-600/20 blur-[80px]" />

            <div className="relative z-10">
              <div className="inline-flex rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/60 sm:text-[11px]">
                Rechazar
              </div>

              <h2 className="mt-4 text-xl font-semibold text-white sm:text-2xl">
                ¿Seguro que queres rechazar este cliente?
              </h2>

              <p className="mt-3 text-sm text-white/55">
                Esta acción eliminará el pendiente seleccionado.
              </p>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeRejectModal}
                  className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-white/75 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => handleReject(rejectCode)}
                  disabled={rejectingCode === rejectCode}
                  className="w-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 font-medium text-red-200 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  {rejectingCode === rejectCode
                    ? "Rechazando..."
                    : "Si, rechazar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
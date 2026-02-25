"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { atualizarStatusViagem } from "../app/actions/viagens";
import { Check, Square, X, Edit2 } from "lucide-react";

// ── Stable color palette ──────────────────────────────────────────────────────
const PALETTE = [
    "#ef4444", "#3b82f6", "#10b981", "#f59e0b",
    "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6",
    "#f97316", "#06b6d4", "#84cc16", "#d946ef",
];
function hashColor(id: string): string {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h);
    return PALETTE[Math.abs(h) % PALETTE.length];
}

// ── Date helpers (no external deps) ──────────────────────────────────────────
const MONTH_NAMES = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function parseUTC(iso: string) {
    return new Date(iso.substring(0, 10) + "T12:00:00Z");
}
function fmt(iso: string | null | undefined) {
    if (!iso) return "—";
    return parseUTC(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

/** Returns all calendar cells for a month (including leading/trailing days from adj months) */
function buildCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay(); // 0=Sun
    const endDow = lastDay.getDay();

    const days: { date: Date; thisMonth: boolean }[] = [];

    // Leading days from previous month
    for (let i = startDow - 1; i >= 0; i--) {
        const d = new Date(year, month, -i);
        days.push({ date: d, thisMonth: false });
    }
    // All days this month
    for (let d = 1; d <= lastDay.getDate(); d++) {
        days.push({ date: new Date(year, month, d), thisMonth: true });
    }
    // Trailing days from next month to complete last week
    const remaining = 6 - endDow;
    for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), thisMonth: false });
    }

    return days;
}

function sameDate(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();
}
function isToday(d: Date) { return sameDate(d, new Date()); }

// ── Types ─────────────────────────────────────────────────────────────────────
interface Veiculo { id: string; prefixo?: string; placa?: string; cor_veiculo?: string | null; }
interface Viagem {
    id: string; veiculoId?: string; nome_viagem: string; codigo_interno?: string;
    data_partida: string; data_retorno: string; status: string; qtd_passageiros?: number;
    veiculo?: any; motorista1?: any; motorista2?: any;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function CalendarioGrid({
    veiculos = [],
    viagens = [],
    anoInicial,
    mesInicial,
}: {
    veiculos: Veiculo[];
    viagens: Viagem[];
    anoInicial: number;
    mesInicial: number;
}) {
    const [ano, setAno] = useState(anoInicial);
    const [mes, setMes] = useState(mesInicial);
    const [visivel, setVisivel] = useState<Set<string>>(
        () => new Set(veiculos.map(v => v.id))
    );
    const [selecionada, setSelecionada] = useState<Viagem | null>(null);

    const coresPorId = useMemo(() => {
        const m: Record<string, string> = {};
        veiculos.forEach(v => { m[v.id] = v.cor_veiculo || hashColor(v.id); });
        return m;
    }, [veiculos]);

    function prevMes() { if (mes === 0) { setMes(11); setAno(a => a - 1); } else setMes(m => m - 1); }
    function nextMes() { if (mes === 11) { setMes(0); setAno(a => a + 1); } else setMes(m => m + 1); }
    function goToToday() { const n = new Date(); setAno(n.getFullYear()); setMes(n.getMonth()); }

    const calDays = useMemo(() => buildCalendarDays(ano, mes), [ano, mes]);

    /** Trips that fall on `day` and whose vehicle is visible */
    function tripsOnDay(day: Date) {
        return viagens.filter(v => {
            if (!v.veiculoId || !visivel.has(v.veiculoId)) return false;
            const start = parseUTC(v.data_partida);
            const end = parseUTC(v.data_retorno);
            const cur = new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate(), 12));
            return cur >= start && cur <= end;
        });
    }

    return (
        <div style={{ display: "flex", gap: "20px", alignItems: "flex-start", fontFamily: "sans-serif" }}>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <div style={{ width: "175px", flexShrink: 0, background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <p style={{ margin: "0 0 12px", fontSize: "11px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>Frota</p>

                {/* Mass buttons */}
                <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
                    <button onClick={() => setVisivel(new Set(veiculos.map(v => v.id)))}
                        style={{ flex: 1, padding: "5px 0", fontSize: "11px", fontWeight: "700", border: "1px solid #d1d5db", borderRadius: "6px", background: "#f9fafb", cursor: "pointer", color: "#374151" }}>
                        <Check size={14} /> Todos
                    </button>
                    <button onClick={() => setVisivel(new Set())}
                        style={{ flex: 1, padding: "5px 0", fontSize: "11px", fontWeight: "700", border: "1px solid #d1d5db", borderRadius: "6px", background: "#f9fafb", cursor: "pointer", color: "#374151" }}>
                        <Square size={14} /> Nenhum
                    </button>
                </div>

                {/* Per-vehicle toggles */}
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {veiculos.map(v => {
                        const cor = coresPorId[v.id];
                        const ativo = visivel.has(v.id);
                        const label = v.prefixo || v.placa || "—";
                        return (
                            <button key={v.id}
                                onClick={() => setVisivel(prev => {
                                    const next = new Set(prev);
                                    ativo ? next.delete(v.id) : next.add(v.id);
                                    return next;
                                })}
                                title={label}
                                style={{
                                    display: "flex", alignItems: "center", gap: "8px",
                                    padding: "6px 8px", borderRadius: "8px", cursor: "pointer",
                                    border: ativo ? `1px solid ${cor} 33` : "1px solid #e5e7eb",
                                    background: ativo ? `${cor} 12` : "#f9fafb",
                                    opacity: ativo ? 1 : 0.45,
                                    transition: "all 0.15s", textAlign: "left", width: "100%",
                                }}
                            >
                                <div style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: cor, flexShrink: 0 }} />
                                <span style={{ fontSize: "12px", fontWeight: "700", color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                    {veiculos.length === 0 && <p style={{ fontSize: "12px", color: "#9ca3af" }}>Nenhum veículo</p>}
                </div>
            </div>

            {/* ── Calendar grid ───────────────────────────────────────────── */}
            <div style={{ flex: 1, background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" }}>

                {/* Month nav */}
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <button onClick={prevMes} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>‹</button>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontSize: "16px", fontWeight: "800", color: "#111827" }}>
                            {MONTH_NAMES[mes]} {ano}
                        </span>
                        <button onClick={goToToday} style={{ padding: "4px 12px", borderRadius: "6px", border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: "12px", fontWeight: "600", color: "#374151" }}>
                            Hoje
                        </button>
                    </div>
                    <button onClick={nextMes} style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: "14px", fontWeight: "600" }}>›</button>
                </div>

                <div style={{ padding: "12px 16px 16px" }}>
                    {/* Weekday headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "6px" }}>
                        {WEEK_DAYS.map(d => (
                            <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 0" }}>
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                        {calDays.map(({ date, thisMonth }) => {
                            const today = isToday(date);
                            const trips = tripsOnDay(date);
                            return (
                                <div key={date.toISOString()} style={{
                                    minHeight: "110px", padding: "6px",
                                    borderRadius: "10px",
                                    border: today ? "2px solid #111827" : "1px solid #f3f4f6",
                                    background: thisMonth ? "#fff" : "#fafafa",
                                    opacity: thisMonth ? 1 : 0.45,
                                    transition: "border-color 0.15s",
                                }}>
                                    {/* Day number */}
                                    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "4px" }}>
                                        <span style={{
                                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                                            width: "26px", height: "26px", borderRadius: "50%",
                                            fontSize: "12px", fontWeight: today ? "800" : "600",
                                            background: today ? "#111827" : "transparent",
                                            color: today ? "#fff" : thisMonth ? "#374151" : "#9ca3af",
                                        }}>
                                            {date.getDate()}
                                        </span>
                                    </div>

                                    {/* Trip pills */}
                                    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                                        {trips.slice(0, 3).map(vg => {
                                            const cor = coresPorId[vg.veiculoId!] || "#374151";
                                            const veiculo = veiculos.find(v => v.id === vg.veiculoId);
                                            return (
                                                <div key={vg.id}
                                                    onClick={() => setSelecionada(vg)}
                                                    title={`${veiculo?.prefixo || "—"} — ${vg.nome_viagem} `}
                                                    style={{
                                                        background: cor, color: "#fff",
                                                        borderRadius: "5px", padding: "2px 6px",
                                                        fontSize: "10px", fontWeight: "700",
                                                        cursor: "pointer", overflow: "hidden",
                                                        whiteSpace: "nowrap", textOverflow: "ellipsis",
                                                        lineHeight: "1.4",
                                                        boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
                                                        transition: "filter 0.1s",
                                                    }}
                                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.filter = "brightness(1.15)"}
                                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.filter = ""}
                                                >
                                                    <span style={{ opacity: 0.8 }}>{veiculo?.prefixo} </span>
                                                    {vg.codigo_interno || vg.nome_viagem}
                                                </div>
                                            );
                                        })}
                                        {trips.length > 3 && (
                                            <div style={{ fontSize: "10px", color: "#6b7280", fontWeight: "600", paddingLeft: "4px" }}>
                                                +{trips.length - 3} mais
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Detail modal ────────────────────────────────────────────── */}
            {selecionada && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 999999, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", width: "460px", maxWidth: "90%", boxShadow: "0 25px 50px rgba(0,0,0,0.35)", fontFamily: "sans-serif", overflow: "hidden" }}>
                        {/* Header */}
                        <div style={{ padding: "18px 22px", borderBottom: "1px solid #e5e7eb", backgroundColor: "#111827", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                {selecionada.codigo_interno && (
                                    <p style={{ margin: "0 0 2px", fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>{selecionada.codigo_interno}</p>
                                )}
                                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#fff" }}>{selecionada.nome_viagem}</h2>
                            </div>
                            <button onClick={() => setSelecionada(null)} style={{ background: "none", border: "none", color: "#6b7280", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={20} /></button>
                        </div>
                        {/* Body */}
                        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "#374151" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {[
                                    { label: "Partida", val: fmt(selecionada.data_partida) },
                                    { label: "Retorno", val: fmt(selecionada.data_retorno) },
                                    { label: "Veículo", val: selecionada.veiculo?.prefixo ?? "—" },
                                    { label: "Motorista", val: selecionada.motorista1?.nome_completo ?? "—" },
                                ].map(({ label, val }) => (
                                    <div key={label}>
                                        <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" }}>{label}</p>
                                        <p style={{ margin: 0, fontWeight: "600" }}>{val}</p>
                                    </div>
                                ))}
                            </div>
                            {selecionada.motorista2?.nome_completo && (
                                <p style={{ margin: 0, fontSize: "12px", color: "#6b7280" }}>2º motorista: {selecionada.motorista2.nome_completo}</p>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" }}>Status:</p>
                                <span style={{
                                    padding: "2px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                                    backgroundColor: selecionada.status === "CONCLUIDA" ? "#f0fdf4" : selecionada.status === "CANCELADA" ? "#fef2f2" : "#eff6ff",
                                    color: selecionada.status === "CONCLUIDA" ? "#16a34a" : selecionada.status === "CANCELADA" ? "#dc2626" : "#2563eb",
                                }}>
                                    {selecionada.status}
                                </span>
                            </div>
                            {selecionada.qtd_passageiros && (
                                <p style={{ margin: 0, fontSize: "13px" }}><strong>Passageiros previstos:</strong> {selecionada.qtd_passageiros}</p>
                            )}
                        </div>
                        {/* Footer */}
                        <div style={{ padding: "14px 22px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f9fafb" }}>
                            <button
                                onClick={async () => {
                                    if (!window.confirm("Cancelar esta viagem?")) return;
                                    await atualizarStatusViagem(selecionada.id, "CANCELADA");
                                    setSelecionada(null);
                                }}
                                style={{ padding: "7px 14px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
                                Cancelar Viagem
                            </button>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button onClick={() => setSelecionada(null)} style={{ padding: "7px 14px", backgroundColor: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "12px", cursor: "pointer" }}>
                                    Fechar
                                </button>
                                <Link href={`/ viagens / ${selecionada.id}/editar`} style={{ padding: "7px 16px", backgroundColor: "#111827", color: "#fff", borderRadius: "8px", fontWeight: "700", fontSize: "12px", textDecoration: "none" }}>
                                    <Edit2 size={16} /> Editar
                                </Link >
                            </div >
                        </div >
                    </div >
                </div >
            )}
        </div >
    );
}

"use client";
import React, { useState, useEffect } from "react";
import { buscarResumoViagem } from "../app/actions/viagens";
import { useRouter } from "next/navigation";
import { Hourglass, PartyPopper, ClipboardList, CalendarDays, Building2, DollarSign, CheckCircle } from "lucide-react";

function InfoBlock({ label, value, col = 1 }: { label: string; value: React.ReactNode; col?: number }) {
    return (
        <div style={{ gridColumn: `span ${col}` }}>
            <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{value || <span style={{ color: "#d1d5db" }}>—</span>}</div>
        </div>
    );
}

function fmtDate(d: string | null | undefined) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("pt-BR");
}

function fmtBRL(v: number) {
    return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
    HOTEL: { bg: "#eff6ff", color: "#1d4ed8" },
    GUIA: { bg: "#f0fdf4", color: "#16a34a" },
    INGRESSO: { bg: "#fef3c7", color: "#d97706" },
    TRANSPORTE: { bg: "#f3e8ff", color: "#7c3aed" },
    ALIMENTAÇÃO: { bg: "#fef9c3", color: "#ca8a04" },
    SEGURO: { bg: "#ecfeff", color: "#0891b2" },
    TRANSFER: { bg: "#fce7f3", color: "#be185d" },
    BARCO: { bg: "#e0f2fe", color: "#0284c7" },
    OUTRO: { bg: "#f3f4f6", color: "#6b7280" },
};

export default function PassoResumo({ viagemId, onVoltar }: { viagemId: string; onVoltar: () => void }) {
    const [resumo, setResumo] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        buscarResumoViagem(viagemId).then(setResumo);
    }, [viagemId]);

    if (!resumo) {
        return (
            <div style={{ textAlign: "center", padding: "60px 24px", color: "#9ca3af", fontFamily: "sans-serif" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                    <Hourglass size={36} color="#9ca3af" />
                </div>
                <p style={{ fontWeight: "600" }}>A gerar o resumo final da viagem…</p>
            </div>
        );
    }

    const custoTotal = resumo.fornecedores.reduce((acc: number, f: any) => acc + Number(f.valor), 0);
    const valorPacote = Number(resumo.valor_pacote) || 0;
    const saldo = valorPacote - custoTotal;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px", fontFamily: "sans-serif" }}>
            <div>
                <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "800", color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><PartyPopper size={16} /> Resumo Final da Viagem</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>Confira todos os dados antes de concluir.</p>
            </div>

            {/* ── Dados Básicos ── */}
            <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px" }}>
                <p style={{ margin: "0 0 16px", fontSize: "11px", fontWeight: "800", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><ClipboardList size={14} /> Dados Básicos</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    <InfoBlock label="Código / Nome" value={<>{resumo.codigo_interno && <span style={{ color: "#9ca3af", marginRight: "6px", fontSize: "12px" }}>{resumo.codigo_interno} —</span>}<strong>{resumo.nome_viagem}</strong></>} col={2} />
                    <InfoBlock label="Tipo" value={resumo.tipo_viagem} />
                    <InfoBlock label="Partida" value={fmtDate(resumo.data_partida)} />
                    <InfoBlock label="Retorno" value={fmtDate(resumo.data_retorno)} />
                    <InfoBlock label="Duração" value={resumo.qtd_dias ? `${resumo.qtd_dias} dias / ${resumo.qtd_noites ?? "?"} noites` : null} />
                    <InfoBlock label="Veículo" value={resumo.veiculo?.prefixo} />
                    <InfoBlock label="Motorista 1" value={resumo.motorista1?.nome_completo} />
                    <InfoBlock label="Motorista 2" value={resumo.motorista2?.nome_completo} />
                    {resumo.pacote_inclui && (
                        <div style={{ gridColumn: "span 3" }}>
                            <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" }}>Pacote Inclui</p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#374151", background: "#fff", padding: "10px 12px", borderRadius: "8px", border: "1px solid #e5e7eb", whiteSpace: "pre-line" }}>{resumo.pacote_inclui}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Roteiro ── */}
            {resumo.roteiros.length > 0 && (
                <div style={{ background: "#f0f9ff", borderRadius: "12px", border: "1px solid #bae6fd", padding: "20px" }}>
                    <p style={{ margin: "0 0 14px", fontSize: "11px", fontWeight: "800", color: "#0891b2", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><CalendarDays size={14} /> Roteiro ({resumo.roteiros.length} dia{resumo.roteiros.length > 1 ? "s" : ""})</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {resumo.roteiros.map((r: any, idx: number) => (
                            <div key={r.id} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                                <span style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#0891b2", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0, marginTop: "1px" }}>{idx + 1}</span>
                                <div>
                                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#0891b2", marginRight: "8px" }}>{fmtDate(r.data)}</span>
                                    <span style={{ fontSize: "13px", color: "#374151" }}>{r.descricao}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Fornecedores ── */}
            {resumo.fornecedores.length > 0 && (
                <div style={{ background: "#faf5ff", borderRadius: "12px", border: "1px solid #e9d5ff", padding: "20px" }}>
                    <p style={{ margin: "0 0 14px", fontSize: "11px", fontWeight: "800", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><Building2 size={14} /> Fornecedores ({resumo.fornecedores.length})</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {resumo.fornecedores.map((f: any) => {
                            const tc = TIPO_COLORS[f.tipo_custo] || TIPO_COLORS["OUTRO"];
                            return (
                                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#fff", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "10px", fontWeight: "700", backgroundColor: tc.bg, color: tc.color }}>{f.tipo_custo}</span>
                                        <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>{f.fornecedor}</span>
                                        {f.data_pgto && <span style={{ fontSize: "11px", color: "#9ca3af" }}>pgto: {fmtDate(f.data_pgto)}</span>}
                                    </div>
                                    <span style={{ fontFamily: "monospace", fontWeight: "700", color: "#111827" }}>R$ {fmtBRL(Number(f.valor))}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Balanço Financeiro ── */}
            <div style={{ background: "#f8fafc", borderRadius: "12px", border: "2px dashed #d1d5db", padding: "24px" }}>
                <p style={{ margin: "0 0 20px", fontSize: "11px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><DollarSign size={14} /> Balanço Financeiro Estimado</p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" }}>Valor do Pacote</p>
                        <p style={{ margin: 0, fontSize: "26px", fontWeight: "900", color: "#059669", fontFamily: "monospace" }}>R$ {fmtBRL(valorPacote)}</p>
                    </div>
                    <span style={{ fontSize: "28px", color: "#d1d5db", fontWeight: "200" }}>−</span>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" }}>Custo Fornecedores</p>
                        <p style={{ margin: 0, fontSize: "26px", fontWeight: "900", color: "#dc2626", fontFamily: "monospace" }}>R$ {fmtBRL(custoTotal)}</p>
                    </div>
                    <span style={{ fontSize: "28px", color: "#d1d5db", fontWeight: "200" }}>=</span>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" }}>Saldo Estimado</p>
                        <p style={{ margin: 0, fontSize: "28px", fontWeight: "900", fontFamily: "monospace", color: saldo >= 0 ? "#2563eb" : "#dc2626" }}>
                            {saldo >= 0 ? "+" : ""}R$ {fmtBRL(saldo)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Wizard nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                <button onClick={onVoltar} style={{ padding: "9px 22px", backgroundColor: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                    ← Voltar para Fornecedores
                </button>
                <button onClick={() => router.push("/viagens")} style={{ padding: "11px 36px", backgroundColor: "#059669", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "900", fontSize: "15px", cursor: "pointer", letterSpacing: "0.06em", boxShadow: "0 4px 14px rgba(5,150,105,0.35)", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle size={18} /> CONCLUIR E SALVAR
                </button>
            </div>
        </div>
    );
}

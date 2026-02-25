"use client";
import React, { useState, useEffect, useRef } from "react";
import { adicionarRoteiro, buscarRoteiros, deletarRoteiro } from "../app/actions/roteiros";
import { CalendarDays, X } from "lucide-react";

const inp: React.CSSProperties = { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb", color: "#374151", width: "100%", boxSizing: "border-box" };
const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" };

export default function PassoRoteiro({ viagemId, onAvancar, onVoltar }: { viagemId: string; onAvancar: () => void; onVoltar: () => void }) {
    const [roteiros, setRoteiros] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    async function carregar() {
        setLoading(true);
        const dados = await buscarRoteiros(viagemId);
        setRoteiros(dados);
        setLoading(false);
    }

    useEffect(() => { carregar(); }, [viagemId]);

    async function handleAdicionar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setAdding(true);
        const formData = new FormData(e.currentTarget);
        formData.set("viagemId", viagemId);
        const res = await adicionarRoteiro(formData);
        if (res?.erro) alert(res.erro);
        else { formRef.current?.reset(); await carregar(); }
        setAdding(false);
    }

    async function handleDeletar(id: string) {
        if (!window.confirm("Excluir este dia do roteiro?")) return;
        await deletarRoteiro(id);
        await carregar();
    }

    function fmtDate(d: string) {
        return new Date(d).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "sans-serif" }}>
            <div>
                <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "800", color: "#0891b2", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><CalendarDays size={16} /> Roteiro da Viagem</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    Adicione cada dia de atividade. A lista é salva em tempo real, sem precisar avançar.
                </p>
            </div>

            {/* Add form */}
            <form ref={formRef} onSubmit={handleAdicionar} style={{ display: "grid", gridTemplateColumns: "180px 1fr auto", gap: "12px", alignItems: "flex-end", padding: "16px", background: "#f0f9ff", borderRadius: "10px", border: "1px solid #bae6fd" }}>
                <div>
                    <label style={lbl}>Data do Dia *</label>
                    <input type="date" name="data" required style={inp} />
                </div>
                <div>
                    <label style={lbl}>Descrição / Programação *</label>
                    <input type="text" name="descricao" required placeholder="Ex: Saída de Porto Alegre às 22h — chegada em Gramado às 06h" style={inp} />
                </div>
                <button type="submit" disabled={adding} style={{ padding: "8px 18px", backgroundColor: "#0891b2", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", opacity: adding ? 0.7 : 1, height: "37px" }}>
                    {adding ? "..." : "+ Adicionar"}
                </button>
            </form>

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", width: "160px" }}>Data</th>
                            <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Programação</th>
                            <th style={{ padding: "11px 16px", width: "80px" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={3} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Carregando…</td></tr>
                        ) : roteiros.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                                        <CalendarDays size={32} color="#9ca3af" />
                                    </div>
                                    <div style={{ fontWeight: "600" }}>Nenhum dia adicionado ainda</div>
                                    <div style={{ fontSize: "12px", marginTop: "4px" }}>Use o formulário acima para montar o roteiro.</div>
                                </td>
                            </tr>
                        ) : (
                            roteiros.map((r, idx) => (
                                <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}
                                    className="hover:bg-gray-50 transition-colors">
                                    <td style={{ padding: "13px 16px" }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                                            <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0891b2", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>
                                                {idx + 1}
                                            </span>
                                            <span style={{ fontWeight: "700", color: "#374151" }}>{fmtDate(r.data)}</span>
                                        </span>
                                    </td>
                                    <td style={{ padding: "13px 16px", color: "#6b7280" }}>{r.descricao}</td>
                                    <td style={{ padding: "13px 16px", textAlign: "right" }}>
                                        <button onClick={() => handleDeletar(r.id)} style={{ padding: "4px 8px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                            <X size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {roteiros.length > 0 && (
                <p style={{ margin: 0, fontSize: "12px", color: "#0891b2", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <CalendarDays size={14} /> {roteiros.length} dia(s) no roteiro
                </p>
            )}

            {/* Wizard nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                <button onClick={onVoltar} style={{ padding: "9px 22px", backgroundColor: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                    ← Voltar
                </button>
                <button onClick={onAvancar} style={{ padding: "9px 28px", backgroundColor: "#111827", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "14px", cursor: "pointer", letterSpacing: "0.05em" }}>
                    AVANÇAR → Fornecedores
                </button>
            </div>
        </div>
    );
}

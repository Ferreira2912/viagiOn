"use client";
import React, { useState, useEffect, useRef } from "react";
import { adicionarFornecedor, buscarFornecedores, deletarFornecedor } from "../app/actions/fornecedores";
import { Building2, DollarSign, X } from "lucide-react";

const inp: React.CSSProperties = { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb", color: "#374151", width: "100%", boxSizing: "border-box" };
const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" };

const TIPOS = ["HOTEL", "GUIA", "INGRESSO", "TRANSPORTE", "ALIMENTAÇÃO", "SEGURO", "TRANSFER", "BARCO", "OUTRO"];

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

export default function PassoFornecedores({ viagemId, onAvancar, onVoltar }: { viagemId: string; onAvancar: () => void; onVoltar: () => void }) {
    const [fornecedores, setFornecedores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    function handleCurrencyChange(e: React.ChangeEvent<HTMLInputElement>) {
        let v = e.target.value.replace(/\D/g, "");
        if (!v) { e.target.value = ""; return; }
        v = (Number(v) / 100).toFixed(2);
        v = v.replace(".", ",");
        v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        e.target.value = v;
    }
    const [adding, setAdding] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);

    async function carregar() {
        setLoading(true);
        const dados = await buscarFornecedores(viagemId);
        setFornecedores(dados);
        setLoading(false);
    }

    useEffect(() => { carregar(); }, [viagemId]);

    async function handleAdicionar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setAdding(true);
        const formData = new FormData(e.currentTarget);
        formData.set("viagemId", viagemId);
        const res = await adicionarFornecedor(formData);
        if (res?.erro) alert(res.erro);
        else { formRef.current?.reset(); await carregar(); }
        setAdding(false);
    }

    async function handleDeletar(id: string) {
        if (!window.confirm("Excluir este custo?")) return;
        await deletarFornecedor(id);
        await carregar();
    }

    const valorTotal = fornecedores.reduce((acc, f) => acc + Number(f.valor), 0);

    function fmtDate(d: string | null | undefined) {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("pt-BR");
    }

    function fmtBRL(v: number) {
        return v.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "sans-serif" }}>
            <div>
                <p style={{ margin: "0 0 6px", fontSize: "12px", fontWeight: "800", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><Building2 size={16} /> Fornecedores e Custos</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                    Registre hotéis, guias, ingressos e outros custos da viagem. O total é calculado automaticamente.
                </p>
            </div>

            {/* Add form */}
            <form ref={formRef} onSubmit={handleAdicionar} style={{ display: "grid", gridTemplateColumns: "1fr 160px 130px 130px auto", gap: "10px", alignItems: "flex-end", padding: "16px", background: "#faf5ff", borderRadius: "10px", border: "1px solid #e9d5ff" }}>
                <div>
                    <label style={lbl}>Fornecedor / Nome *</label>
                    <input type="text" name="fornecedor" required placeholder="Ex: Hotel Serra Bela, Guia João..." style={inp} />
                </div>
                <div>
                    <label style={lbl}>Tipo *</label>
                    <select name="tipo_custo" required style={inp}>
                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                    <label style={lbl}>Valor R$ *</label>
                    <input type="text" name="valor" required placeholder="1.250,00" style={inp} onChange={handleCurrencyChange} />
                </div>
                <div>
                    <label style={lbl}>Data Pagamento</label>
                    <input type="date" name="data_pgto" style={inp} />
                </div>
                <button type="submit" disabled={adding} style={{ padding: "8px 16px", backgroundColor: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap", opacity: adding ? 0.7 : 1, height: "37px" }}>
                    {adding ? "..." : "+ Add"}
                </button>
            </form>

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Fornecedor</th>
                            <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", width: "140px" }}>Tipo</th>
                            <th style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", width: "130px" }}>Data Pgto</th>
                            <th style={{ padding: "11px 16px", textAlign: "right", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", width: "140px" }}>Valor</th>
                            <th style={{ padding: "11px 16px", width: "60px" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Carregando…</td></tr>
                        ) : fornecedores.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#9ca3af" }}>
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "8px" }}>
                                        <Building2 size={32} color="#9ca3af" />
                                    </div>
                                    <div style={{ fontWeight: "600" }}>Nenhum custo adicionado ainda</div>
                                    <div style={{ fontSize: "12px", marginTop: "4px" }}>Use o formulário acima para registrar fornecedores.</div>
                                </td>
                            </tr>
                        ) : (
                            fornecedores.map((f) => {
                                const tc = TIPO_COLORS[f.tipo_custo] || TIPO_COLORS["OUTRO"];
                                return (
                                    <tr key={f.id} style={{ borderBottom: "1px solid #f3f4f6" }} className="hover:bg-gray-50 transition-colors">
                                        <td style={{ padding: "13px 16px", fontWeight: "600", color: "#111827" }}>{f.fornecedor}</td>
                                        <td style={{ padding: "13px 16px" }}>
                                            <span style={{ padding: "3px 9px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: tc.bg, color: tc.color }}>
                                                {f.tipo_custo}
                                            </span>
                                        </td>
                                        <td style={{ padding: "13px 16px", color: "#6b7280" }}>{fmtDate(f.data_pgto)}</td>
                                        <td style={{ padding: "13px 16px", textAlign: "right", fontWeight: "700", color: "#111827", fontFamily: "monospace" }}>
                                            R$ {fmtBRL(Number(f.valor))}
                                        </td>
                                        <td style={{ padding: "13px 16px", textAlign: "right" }}>
                                            <button onClick={() => handleDeletar(f.id)} style={{ padding: "4px 8px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                                <X size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}

                        {/* Totals row */}
                        {!loading && fornecedores.length > 0 && (
                            <tr style={{ backgroundColor: "#faf5ff", borderTop: "2px solid #d8b4fe" }}>
                                <td colSpan={3} style={{ padding: "14px 16px", fontWeight: "800", color: "#7c3aed", textAlign: "right", fontSize: "13px", textTransform: "uppercase" }}>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}><DollarSign size={16} /> Custo Total da Viagem:</div>
                                </td>
                                <td style={{ padding: "14px 16px", textAlign: "right", fontWeight: "800", color: "#7c3aed", fontSize: "15px", fontFamily: "monospace" }}>
                                    R$ {fmtBRL(valorTotal)}
                                </td>
                                <td />
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {fornecedores.length > 0 && (
                <p style={{ margin: 0, fontSize: "12px", color: "#7c3aed", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Building2 size={14} /> {fornecedores.length} custo(s) registrado(s) • Total: R$ {fmtBRL(valorTotal)}
                </p>
            )}

            {/* Wizard nav */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                <button onClick={onVoltar} style={{ padding: "9px 22px", backgroundColor: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                    ← Voltar para Roteiro
                </button>
                <button onClick={onAvancar} style={{ padding: "9px 28px", backgroundColor: "#111827", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "14px", cursor: "pointer", letterSpacing: "0.05em" }}>
                    AVANÇAR → Resumo
                </button>
            </div>
        </div>
    );
}

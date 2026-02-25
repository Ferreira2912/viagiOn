"use client";
import React, { useState } from "react";
import { salvarManutencao, deletarManutencao } from "../app/actions/manutencoes";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Edit2, Wrench, Trash2, Save, Plus, X, Check } from "lucide-react";

const TIPOS = [
    "Revisão Geral", "Troca de Óleo", "Troca de Pneus", "Freios", "Suspensão",
    "Elétrica", "Funilaria / Pintura", "Ar-condicionado", "Motor", "Câmbio",
    "Embreagem", "Injeção Eletrônica", "Limpeza / Higienização", "Outro"
];

function fmt(date: string | Date | null | undefined): string {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
}

const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" };
const inp: React.CSSProperties = { padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb", color: "#374151", width: "100%", boxSizing: "border-box" };

export default function ModalManutencao({ veiculos = [], manutencao, isEdit = false }: { veiculos?: any[]; manutencao?: any; isEdit?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const res = await salvarManutencao(formData);
        setLoading(false);
        if (res?.erro) alert(res.erro);
        else setIsOpen(false);
    }

    async function handleDelete() {
        if (!manutencao?.id) return;
        if (!window.confirm("Excluir esta manutenção?")) return;
        const res = await deletarManutencao(manutencao.id);
        if (res?.erro) alert(res.erro);
        else setIsOpen(false);
    }

    return (
        <>
            <button onClick={() => setIsOpen(true)} style={{
                padding: "6px 14px",
                backgroundColor: isEdit ? "#f3f4f6" : "#111827",
                color: isEdit ? "#374151" : "#fff",
                border: "1px solid #e5e7eb", borderRadius: "7px",
                fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "sans-serif"
            }}>
                {isEdit ? <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Edit2 size={14} /> Editar</span> : <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /> Nova Manutenção</span>}
            </button>

            {isOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 99999, display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", padding: "24px" }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", width: "680px", maxWidth: "95%", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", fontFamily: "sans-serif", marginBottom: "24px" }}>
                        {/* Header */}
                        <div style={{ padding: "20px 24px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#8b5cf6", borderRadius: "16px 16px 0 0" }}>
                            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
                                {isEdit ? <><Edit2 size={20} /> Editando Manutenção</> : <><Wrench size={20} /> Nova Manutenção</>}
                            </h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={20} /></button>
                        </div>

                        <form action={handleSubmit} style={{ padding: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}>
                            {manutencao?.id && <input type="hidden" name="id" value={manutencao.id} />}

                            {/* Linha 1: Fornecedor + Tipo */}
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={lbl}>Fornecedor / Oficina *</label>
                                    <input type="text" name="fornecedor" required defaultValue={manutencao?.fornecedor || ""} placeholder="Nome da oficina..." style={inp} />
                                </div>
                                <div>
                                    <label style={lbl}>Tipo de Manutenção *</label>
                                    <select name="tipo_manutencao" required defaultValue={manutencao?.tipo_manutencao || ""} style={inp}>
                                        <option value="">Selecione...</option>
                                        {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Linha 2: Veículo + KM + Data */}
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={lbl}>Veículo *</label>
                                    <select name="veiculoId" required defaultValue={manutencao?.veiculoId || ""} style={inp}>
                                        <option value="">Selecione o veículo...</option>
                                        {veiculos.map((v: any) => (
                                            <option key={v.id} value={v.id}>{v.prefixo} — {v.placa}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label style={lbl}>Quilometragem</label>
                                    <input type="number" name="quilometragem" defaultValue={manutencao?.quilometragem || ""} placeholder="Ex: 120000" style={inp} />
                                </div>
                                <div>
                                    <label style={lbl}>Data *</label>
                                    <input type="date" name="data_manutencao" required defaultValue={fmt(manutencao?.data_manutencao)} style={inp} />
                                </div>
                            </div>

                            {/* Checkboxes */}
                            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                                <label style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px", fontWeight: "600", color: "#374151", cursor: "pointer" }}>
                                    <input type="hidden" name="agendar_proxima" value="false" />
                                    <input type="checkbox" name="agendar_proxima" value="true" defaultChecked={manutencao?.agendar_proxima} style={{ width: "16px", height: "16px", accentColor: "#7c3aed" }} />
                                    Agendar próxima manutenção
                                </label>
                                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", color: "#374151" }}>
                                    <input type="checkbox" name="pago" defaultChecked={manutencao?.pago} style={{ width: "16px", height: "16px", cursor: "pointer" }} />
                                    <Check size={16} color="#16a34a" /> Pago
                                </label>
                            </div>

                            {/* Descrição */}
                            <div>
                                <label style={lbl}>Descrição / Observações</label>
                                <textarea name="descricao" defaultValue={manutencao?.descricao || ""} rows={3}
                                    placeholder="Detalhe o serviço realizado..."
                                    style={{ ...inp, resize: "vertical", lineHeight: "1.5" }} />
                            </div>

                            {/* Footer */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
                                <div>
                                    {isEdit && (
                                        <button type="button" onClick={handleDelete} style={{ padding: "8px 16px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Trash2 size={14} /> Excluir
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button type="button" onClick={() => setIsOpen(false)} style={{ padding: "8px 18px", backgroundColor: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={loading} style={{ padding: "8px 22px", backgroundColor: "#7c3aed", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: "4px" }}>
                                        {loading ? "Salvando..." : <><Save size={14} /> Salvar</>}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

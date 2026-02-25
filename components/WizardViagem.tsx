"use client";
import React, { useState } from "react";
import { salvarViagemPasso1 } from "../app/actions/viagens";
import PassoRoteiro from "./PassoRoteiro";
import PassoFornecedores from "./PassoFornecedores";
import PassoResumo from "./PassoResumo";
import { ClipboardList, FileText, CalendarDays, Bus, DollarSign, Check, Hammer } from "lucide-react";

// ─── Stepper ──────────────────────────────────────────────
const PASSOS = [
    { n: 1, label: "Dados Básicos" },
    { n: 2, label: "Roteiro" },
    { n: 3, label: "Fornecedores" },
    { n: 4, label: "Resumo" },
];

function Stepper({ step }: { step: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "28px 0 32px", background: "#fff", borderBottom: "1px solid #e5e7eb", marginBottom: "32px" }}>
            {PASSOS.map((p, idx) => {
                const done = step > p.n;
                const active = step === p.n;
                return (
                    <React.Fragment key={p.n}>
                        {/* Circle */}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                            <div style={{ minWidth: "26px", height: "26px", borderRadius: "50%", background: active ? "#3b82f6" : done ? "#10b981" : "#e5e7eb", color: active || done ? "#fff" : "#9ca3af", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800", transition: "all 0.3s" }}>
                                {done ? <Check size={14} /> : p.n}
                            </div>
                            <span style={{
                                fontSize: "11px", fontWeight: active || done ? "700" : "500",
                                color: active ? "#111827" : done ? "#059669" : "#9ca3af",
                                whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.05em"
                            }}>{p.label}</span>
                        </div>
                        {/* Connector line */}
                        {idx < PASSOS.length - 1 && (
                            <div style={{
                                height: "3px", width: "80px", marginBottom: "28px",
                                background: done ? "#059669" : "#e5e7eb",
                                transition: "background 0.3s"
                            }} />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

// ─── Shared input styles ──────────────────────────────────
const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" };
const inp: React.CSSProperties = { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb", color: "#374151", width: "100%", boxSizing: "border-box" };
const ta: React.CSSProperties = { ...inp, resize: "vertical", lineHeight: "1.6" };

function Field({ label, name, type = "text", defaultValue, placeholder, required, col }: any) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: col ? `calc((100% / ${col}) - 8px)` : "auto" }}>
            <label style={lbl}>{label} {required && <span style={{ color: "#ef4444" }}>*</span>}</label>
            <input
                type={type} name={name} defaultValue={defaultValue ?? ""}
                placeholder={placeholder} required={required} style={inp}
                onChange={(e) => {
                    if (name === "valor_pacote" || name === "valor") {
                        let v = e.target.value.replace(/\D/g, "");
                        if (!v) { e.target.value = ""; return; }
                        v = (Number(v) / 100).toFixed(2);
                        v = v.replace(".", ",");
                        v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                        e.target.value = v;
                    }
                }}
            />
        </div>
    );
}

function Sel({ label, name, options, defaultValue, required }: any) {
    return (
        <div>
            <label style={lbl}>{label}{required && <span style={{ color: "#ef4444" }}> *</span>}</label>
            <select name={name} defaultValue={defaultValue ?? ""} style={inp}>
                <option value="">— selecione —</option>
                {options.map((o: any) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
        </div>
    );
}

// ─── Passo 1 ──────────────────────────────────────────────
function Passo1({ viagem, veiculos, motoristas, onNext }: any) {
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState("");

    async function handleSubmit(formData: FormData) {
        setLoading(true); setErro("");
        const res = await salvarViagemPasso1(formData);
        setLoading(false);
        if (res?.erro) { setErro(res.erro); return; }
        onNext(res.viagemId);
    }

    const TIPOS = ["RODOVIÁRIO", "AÉREO", "MARÍTIMO", "FERROVIÁRIO", "MULTIMODAL"];

    return (
        <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {viagem?.id && <input type="hidden" name="id" value={viagem.id} />}

            {/* Linha 1: Identificação */}
            <div>
                <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: "800", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><ClipboardList size={14} /> Identificação</p>
                <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 200px", gap: "12px" }}>
                    <Field label="Cód. Interno" name="codigo_interno" defaultValue={viagem?.codigo_interno} placeholder="Ex: PKT-001" />
                    <Field label="Nome da Viagem" name="nome_viagem" defaultValue={viagem?.nome_viagem} placeholder="Ex: Gramado e Canela – Julho 2026" required />
                    <Sel label="Tipo" name="tipo_viagem" defaultValue={viagem?.tipo_viagem} options={TIPOS.map(t => ({ value: t, label: t }))} />
                </div>
            </div>

            {/* Linha 2: Textos livres */}
            <div>
                <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: "800", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><FileText size={14} /> Textos da Viagem</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                        <label style={lbl}>Observações</label>
                        <textarea name="observacoes" defaultValue={viagem?.observacoes ?? ""} rows={4} style={ta} placeholder="Informações internas, restrições, notas..." />
                    </div>
                    <div>
                        <label style={lbl}>Pacote Inclui</label>
                        <textarea name="pacote_inclui" defaultValue={viagem?.pacote_inclui ?? ""} rows={4} style={ta} placeholder="• Transporte&#10;• Hotel com café&#10;• Seguro viagem..." />
                    </div>
                </div>
            </div>

            {/* Linha 3: Datas */}
            <div>
                <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: "800", color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><CalendarDays size={14} /> Datas e Duração</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "12px" }}>
                    <Field label="Data de Partida" name="data_partida" type="date" defaultValue={viagem?.data_partida?.split?.("T")?.[0]} required />
                    <Field label="Início Retorno" name="data_inicio_retorno" type="date" defaultValue={viagem?.data_inicio_retorno?.split?.("T")?.[0]} />
                    <Field label="Data de Retorno" name="data_retorno" type="date" defaultValue={viagem?.data_retorno?.split?.("T")?.[0]} required />
                    <Field label="Qtd. Dias" name="qtd_dias" type="number" defaultValue={viagem?.qtd_dias} placeholder="5" />
                    <Field label="Qtd. Noites" name="qtd_noites" type="number" defaultValue={viagem?.qtd_noites} placeholder="4" />
                </div>
            </div>

            {/* Linha 4: Frota e RH */}
            <div>
                <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: "800", color: "#f97316", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><Bus size={14} /> Frota e Equipe</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <Sel label="Veículo" name="veiculoId" defaultValue={viagem?.veiculoId}
                        options={veiculos.map((v: any) => ({ value: v.id, label: `${v.prefixo} — ${v.placa}` }))} />
                    <Sel label="Motorista 1" name="motorista1Id" defaultValue={viagem?.motorista1Id}
                        options={motoristas.map((m: any) => ({ value: m.id, label: m.nome_completo }))} />
                    <Sel label="Motorista 2" name="motorista2Id" defaultValue={viagem?.motorista2Id}
                        options={motoristas.map((m: any) => ({ value: m.id, label: m.nome_completo }))} />
                </div>
            </div>

            {/* Linha 5: Valores */}
            <div>
                <p style={{ margin: "0 0 12px", fontSize: "12px", fontWeight: "800", color: "#dc2626", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><DollarSign size={14} /> Valores e Capacidade</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <Field label="Valor do Pacote (R$)" name="valor_pacote" defaultValue={viagem?.valor_pacote} placeholder="850,00" />
                    <Field label="Qtd. Passageiros Previstos" name="qtd_passageiros" type="number" defaultValue={viagem?.qtd_passageiros} />
                    <Field label="Distância Total (km)" name="distancia_km" type="number" defaultValue={viagem?.distancia_km} />
                </div>
            </div>

            {erro && <p style={{ color: "#dc2626", fontSize: "13px", fontWeight: "600", padding: "10px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>{erro}</p>}

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
                <button type="submit" disabled={loading} style={{ padding: "10px 32px", backgroundColor: "#111827", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "14px", cursor: "pointer", opacity: loading ? 0.7 : 1, letterSpacing: "0.05em" }}>
                    {loading ? "Salvando..." : "AVANÇAR →"}
                </button>
            </div>
        </form>
    );
}

// ─── Passo 2 placeholder ──────────────────────────────────
function PassoPlaceholder({ passoAtual, onBack }: any) {
    return (
        <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
            <span style={{ padding: "6px 16px", background: "#e0f2fe", color: "#0369a1", borderRadius: "8px", fontSize: "13px", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}><Hammer size={16} /> Em construção</span>
            <h2 style={{ margin: "16px 0 8px", fontSize: "18px", color: "#111827" }}>Passo {passoAtual}</h2>
            <p style={{ margin: 0, fontSize: "14px" }}>Este passo ainda não foi implementado.</p>
            <button onClick={onBack} style={{ padding: "8px 20px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", marginTop: "24px" }}>← Voltar</button>
        </div>
    );
}

// ─── Wizard root ──────────────────────────────────────────
export default function WizardViagem({ veiculos = [], motoristas = [], viagem }: { veiculos?: any[]; motoristas?: any[]; viagem?: any }) {
    const [step, setStep] = useState(1);
    const [viagemId, setViagemId] = useState<string>(viagem?.id ?? "");

    function handleNext(id: string) {
        setViagemId(id);
        setStep(s => s + 1);
    }

    return (
        <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", boxShadow: "0 4px 24px rgba(0,0,0,0.07)", overflow: "hidden", fontFamily: "sans-serif" }}>
            <Stepper step={step} />

            <div style={{ padding: "0 40px 40px" }}>
                {step === 1 && <Passo1 viagem={{ ...viagem, id: viagemId || viagem?.id }} veiculos={veiculos} motoristas={motoristas} onNext={handleNext} />}
                {step === 2 && <PassoRoteiro viagemId={viagemId} onAvancar={() => setStep(3)} onVoltar={() => setStep(1)} />}
                {step === 3 && <PassoFornecedores viagemId={viagemId} onAvancar={() => setStep(4)} onVoltar={() => setStep(2)} />}
                {step === 4 && <PassoResumo viagemId={viagemId} onVoltar={() => setStep(3)} />}
            </div>
        </div>
    );
}

"use client";
import React, { useState } from "react";
import { salvarColaborador, deletarColaborador } from "../app/actions/colaboradores";
import { Edit2, User, Briefcase, FileText, Trash2, Save, Plus, X, CheckCircle, XCircle, PauseCircle } from "lucide-react";

function fmt(date: string | null | undefined): string {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
}

function Field({ label, name, defaultValue, type = "text", required = false, placeholder = "" }: {
    label: string; name: string; type?: string; defaultValue?: string; placeholder?: string; required?: boolean;
}) {
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        let v = e.target.value;
        if (name === "cpf") {
            v = v.replace(/\D/g, "");
            if (v.length > 11) v = v.substring(0, 11);
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
        } else if (name === "rg") {
            v = v.replace(/\D/g, "");
            if (v.length > 14) v = v.substring(0, 14);
            e.target.value = v;
        } else if (name === "salario") {
            v = v.replace(/\D/g, "");
            if (!v) { e.target.value = ""; return; }
            v = (Number(v) / 100).toFixed(2);
            v = v.replace(".", ",");
            v = v.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            e.target.value = v;
        }
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
            </label>
            <input
                type={type} name={name} defaultValue={defaultValue || ""} placeholder={placeholder}
                required={required}
                style={{ padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#111827", backgroundColor: "#f9fafb", width: "100%", boxSizing: "border-box" }}
                onChange={handleChange}
                maxLength={name === "cpf" || name === "rg" ? 14 : undefined}
            />
        </div>
    );
}

export default function ModalColaborador({ colaborador, isEdit = false }: { colaborador?: any; isEdit?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const res = await salvarColaborador(formData);
        setLoading(false);
        if (res?.erro) alert(res.erro);
        else setIsOpen(false);
    }

    async function handleDelete() {
        if (!colaborador?.id) return;
        if (!window.confirm(`Excluir "${colaborador.nome_completo}"? Esta ação não pode ser desfeita.`)) return;
        const res = await deletarColaborador(colaborador.id);
        if (res?.erro) alert(res.erro);
        else setIsOpen(false);
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    padding: "6px 14px",
                    backgroundColor: isEdit ? "#f3f4f6" : "#111827",
                    color: isEdit ? "#374151" : "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "7px",
                    fontSize: "13px",
                    fontWeight: "600",
                    cursor: "pointer",
                    fontFamily: "sans-serif"
                }}
            >
                {isEdit ? <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Edit2 size={14} /> Editar</span> : <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /> Novo Colaborador</span>}
            </button>

            {isOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 99999, display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", padding: "24px" }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", width: "860px", maxWidth: "95%", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", fontFamily: "sans-serif", marginBottom: "24px" }}>
                        {/* Header */}
                        <div style={{ padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#064e3b", borderRadius: "16px 16px 0 0" }}>
                            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#f9fafb", display: "flex", alignItems: "center", gap: "6px" }}>
                                {isEdit ? <><Edit2 size={18} /> Editando: {colaborador?.nome_completo}</> : <><User size={18} /> Novo Colaborador</>}
                            </h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#6ee7b7", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={20} /></button>
                        </div>

                        <form action={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "24px" }}>
                            {colaborador?.id && <input type="hidden" name="id" value={colaborador.id} />}

                            {/* SEÇÃO: Dados Pessoais */}
                            <div>
                                <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "800", color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><User size={14} /> Dados Pessoais</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                                    <div style={{ gridColumn: "span 2" }}>
                                        <Field label="Nome Completo" name="nome_completo" defaultValue={colaborador?.nome_completo} required />
                                    </div>
                                    <Field label="CPF" name="cpf" defaultValue={colaborador?.cpf} placeholder="000.000.000-00" />
                                    <Field label="RG" name="rg" defaultValue={colaborador?.rg} />
                                    <Field label="Data de Nascimento" name="data_nascimento" type="date" defaultValue={fmt(colaborador?.data_nascimento)} />
                                    <Field label="Número CNH" name="numero_cnh" defaultValue={colaborador?.cnh} required />
                                    <Field label="Vencimento CNH" name="vencimento_cnh" type="date" defaultValue={fmt(colaborador?.validade_cnh)} />
                                    <Field label="Salário (R$)" name="salario" defaultValue={colaborador?.salario?.toString()} placeholder="3500,00" />
                                </div>
                            </div>

                            {/* SEÇÃO: Dados Profissionais */}
                            <div>
                                <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "800", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><Briefcase size={14} /> Dados Profissionais</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Função</label>
                                        <select name="funcao" defaultValue={colaborador?.funcao || ""} style={{ padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb", color: "#111827" }}>
                                            <option value="">Selecionar...</option>
                                            <optgroup label="Operação">
                                                <option value="Motorista">Motorista</option>
                                                <option value="Motorista de Turismo">Motorista de Turismo</option>
                                                <option value="Auxiliar de Bordo">Auxiliar de Bordo</option>
                                            </optgroup>
                                            <optgroup label="Turismo">
                                                <option value="Guia de Turismo">Guia de Turismo</option>
                                                <option value="Guia Local">Guia Local</option>
                                                <option value="Recepcionista">Recepcionista</option>
                                            </optgroup>
                                            <optgroup label="Administrativo">
                                                <option value="Gerente">Gerente</option>
                                                <option value="Coordenador">Coordenador</option>
                                                <option value="Vendedor">Vendedor</option>
                                                <option value="Administrativo">Administrativo</option>
                                                <option value="Financeiro">Financeiro</option>
                                            </optgroup>
                                            <optgroup label="Manutenção">
                                                <option value="Mecânico">Mecânico</option>
                                                <option value="Lavador">Lavador</option>
                                            </optgroup>
                                        </select>
                                    </div>
                                    <Field label="Local de Trabalho" name="local_trabalho" defaultValue={colaborador?.local_trabalho} />
                                    <Field label="Data de Admissão" name="data_admissao" type="date" defaultValue={fmt(colaborador?.data_admissao)} />
                                    <Field label="Data de Demissão" name="data_demissao" type="date" defaultValue={fmt(colaborador?.data_demissao)} />
                                    <div style={{ gridColumn: "span 2" }}>
                                        <Field label="Endereço" name="endereco" defaultValue={colaborador?.endereco} />
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Status</label>
                                        <select name="status_colaborador" defaultValue={colaborador?.status_colaborador || "CONTRATADO"} style={{ padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb" }}>
                                            <option value="CONTRATADO"><CheckCircle size={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} /> Contratado</option>
                                            <option value="DESLIGADO"><XCircle size={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} /> Desligado</option>
                                            <option value="AFASTADO"><PauseCircle size={14} style={{ display: "inline-block", verticalAlign: "middle", marginRight: "4px" }} /> Afastado</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SEÇÃO: Observações */}
                            <div>
                                <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "800", color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><FileText size={14} /> Observações</p>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                                    <div>
                                        <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Uniformes Entregues</label>
                                        <textarea name="uniformes_entregues" defaultValue={colaborador?.uniformes_entregues || ""} rows={4} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb", resize: "vertical", boxSizing: "border-box" }} placeholder="Ex: Camiseta P (x2), Jaqueta M (x1)..." />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>Informações Gerais</label>
                                        <textarea name="informacoes_gerais" defaultValue={colaborador?.informacoes_gerais || ""} rows={4} style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb", resize: "vertical", boxSizing: "border-box" }} placeholder="Observações gerais sobre o colaborador..." />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                                <div>
                                    {isEdit && (
                                        <button type="button" onClick={handleDelete} style={{ padding: "9px 18px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Trash2 size={14} /> Excluir Colaborador
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button type="button" onClick={() => setIsOpen(false)} style={{ padding: "9px 20px", backgroundColor: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={loading} style={{ padding: "9px 24px", backgroundColor: "#059669", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: "4px" }}>
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

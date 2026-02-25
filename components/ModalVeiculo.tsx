"use client";
import React, { useState } from "react";
import { salvarVeiculo, deletarVeiculo } from "../app/actions/veiculos";
import GeradorCroqui from "./GeradorCroqui";
import UploadArquivos from "./UploadArquivos";
import { Edit2, Bus, ClipboardList, CalendarDays, LayoutGrid, FolderOpen, Trash2, Save, Plus, X } from "lucide-react";

function fmt(date: Date | null | undefined): string {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
}

function Field({ label, name, type = "text", defaultValue, placeholder }: { label: string; name: string; type?: string; defaultValue?: string; placeholder?: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
            <input
                type={type}
                name={name}
                defaultValue={defaultValue || ""}
                placeholder={placeholder}
                style={{ padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#111827", backgroundColor: "#f9fafb", width: "100%", boxSizing: "border-box" }}
                onChange={(e) => {
                    if (name === "custo_km" || name === "valor") {
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

function DateField({ label, name, defaultValue }: { label: string; name: string; defaultValue?: Date | null }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
            <input
                type="date"
                name={name}
                defaultValue={fmt(defaultValue)}
                style={{ padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", color: "#111827", backgroundColor: "#f9fafb", width: "100%", boxSizing: "border-box" }}
            />
        </div>
    );
}

export default function ModalVeiculo({ veiculo, isEdit = false }: { veiculo?: any; isEdit?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const res = await salvarVeiculo(formData);
        setLoading(false);
        if (res?.erro) alert(res.erro);
        else setIsOpen(false);
    }

    async function handleDelete() {
        if (!veiculo?.id) return;
        if (!window.confirm(`Deletar "${veiculo.prefixo}"? Esta ação não pode ser desfeita.`)) return;
        const res = await deletarVeiculo(veiculo.id);
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
                {isEdit ? <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Edit2 size={14} /> Editar</span> : <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Plus size={14} /> Novo Carro</span>}
            </button>

            {isOpen && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.7)", zIndex: 99999, display: "flex", justifyContent: "center", alignItems: "flex-start", overflowY: "auto", padding: "24px" }}>
                    <div style={{ backgroundColor: "#fff", borderRadius: "16px", width: "900px", maxWidth: "95%", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", fontFamily: "sans-serif", marginBottom: "24px" }}>
                        {/* Header */}
                        <div style={{ padding: "20px 28px", borderBottom: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#111827", borderRadius: "16px 16px 0 0" }}>
                            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: "700", color: "#f9fafb", display: "flex", alignItems: "center", gap: "6px" }}>
                                {isEdit ? <><Edit2 size={18} /> Editando: {veiculo?.prefixo}</> : <><Bus size={18} /> Novo Veículo</>}
                            </h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center" }}><X size={20} /></button>
                        </div>

                        <form action={handleSubmit} style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: "24px" }}>
                            {veiculo?.id && <input type="hidden" name="id" value={veiculo.id} />}

                            {/* SEÇÃO: Dados Básicos */}
                            <div>
                                <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "800", color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><ClipboardList size={14} /> Dados Básicos</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
                                    <Field label="Prefixo *" name="prefixo" defaultValue={veiculo?.prefixo} placeholder="Carro 2050" />
                                    <Field label="Placa *" name="placa" defaultValue={veiculo?.placa} placeholder="ABC-1234" />
                                    <Field label="Lugares" name="lugares" type="number" defaultValue={veiculo?.lugares?.toString()} placeholder="42" />
                                    <Field label="Ano Fabricação" name="ano_fabricacao" type="number" defaultValue={veiculo?.ano_fabricacao?.toString()} placeholder="2018" />
                                    <Field label="Ano Modelo" name="ano_modelo" type="number" defaultValue={veiculo?.ano_modelo?.toString()} placeholder="2019" />
                                    <Field label="Tipo de Veículo" name="tipo_veiculo" defaultValue={veiculo?.tipo_veiculo} placeholder="Micro / Leito / Van" />
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Cor (Calendário)</label>
                                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                            <input type="color" name="cor_veiculo" defaultValue={veiculo?.cor_veiculo || "#3b82f6"} style={{ width: "42px", height: "34px", borderRadius: "6px", cursor: "pointer", border: "1px solid #d1d5db", padding: "2px" }} />
                                            <span style={{ fontSize: "12px", color: "#9ca3af" }}>Cor no calendário</span>
                                        </div>
                                    </div>
                                    <Field label="Custo R$/km" name="custo_km" defaultValue={veiculo?.custo_km?.toString()} placeholder="3,50" />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginTop: "12px" }}>
                                    <Field label="Chassi" name="chassi" defaultValue={veiculo?.chassi} />
                                    <Field label="Renavam" name="renavam" defaultValue={veiculo?.renavam} />
                                    <Field label="Marca Carroceria" name="marca_carroceria" defaultValue={veiculo?.marca_carroceria} />
                                    <Field label="Modelo Carroceria" name="modelo_carroceria" defaultValue={veiculo?.modelo_carroceria} />
                                    <Field label="Marca Chassi" name="marca_chassi" defaultValue={veiculo?.marca_chassi} />
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <label style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Status</label>
                                        <select name="status" defaultValue={veiculo?.status || "ATIVO"} style={{ padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb" }}>
                                            <option value="ATIVO">Ativo</option>
                                            <option value="INATIVO">Inativo</option>
                                            <option value="MANUTENCAO">Em Manutenção</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SEÇÃO: Licenças e Validades */}
                            <div>
                                <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "800", color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><CalendarDays size={14} /> Licenças e Validades</p>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                                    <DateField label="Laudo Inspeção" name="laudo_insp_data" defaultValue={veiculo?.laudo_insp_data} />
                                    <DateField label="Licença DAER" name="licenca_daer_data" defaultValue={veiculo?.licenca_daer_data} />
                                    <DateField label="Recefitur" name="recefitur_data" defaultValue={veiculo?.recefitur_data} />
                                    <DateField label="Seguro" name="seguro_data" defaultValue={veiculo?.seguro_data} />
                                    <DateField label="Laudo IMETRO" name="laudo_imetro_data" defaultValue={veiculo?.laudo_imetro_data} />
                                    <DateField label="ANTT" name="antt_data" defaultValue={veiculo?.antt_data} />
                                    <DateField label="Cadastur (Transp.)" name="cadastur_transp_data" defaultValue={veiculo?.cadastur_transp_data} />
                                    <DateField label="Cadastur (Agência)" name="cadastur_agencia_data" defaultValue={veiculo?.cadastur_agencia_data} />
                                    <DateField label="IPVA" name="ipva_data" defaultValue={veiculo?.ipva_data} />
                                </div>
                            </div>

                            {/* SEÇÃO: Croqui de Assentos */}
                            <div>
                                <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "800", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><LayoutGrid size={14} /> Croqui de Assentos</p>
                                <GeradorCroqui configInicial={veiculo?.croqui_config} />
                            </div>

                            {/* SEÇÃO: Arquivos e Documentos */}
                            {veiculo?.id && (
                                <div>
                                    <p style={{ margin: "0 0 12px 0", fontSize: "12px", fontWeight: "800", color: "#059669", textTransform: "uppercase", letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: "4px" }}><FolderOpen size={14} /> Arquivos e Documentos</p>
                                    <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#6b7280" }}>Fotos, PDFs de laudos, CRLV, ANTT, apólices de seguro, etc.</p>

                                </div>
                            )}

                            {/* Footer */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                                <div>
                                    {isEdit && (
                                        <button type="button" onClick={handleDelete} style={{ padding: "9px 18px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                            <Trash2 size={14} /> Excluir Veículo
                                        </button>
                                    )}
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <button type="button" onClick={() => setIsOpen(false)} style={{ padding: "9px 20px", backgroundColor: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>
                                        Cancelar
                                    </button>
                                    <button type="submit" disabled={loading} style={{ padding: "9px 24px", backgroundColor: "#111827", color: "#ffffff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: "4px" }}>
                                        {loading ? "Salvando..." : <><Save size={14} /> Salvar</>}
                                    </button>
                                </div>
                            </div>
                        </form>
                        {veiculo?.id && (
                            <UploadArquivos veiculoId={veiculo.id} />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

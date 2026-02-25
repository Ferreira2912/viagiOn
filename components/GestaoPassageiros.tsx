"use client";
import React, { useState, useEffect } from "react";
import { adicionarPassageiro, removerPassageiro, buscarPassageiros } from "../app/actions/passageiros";
import { Users, CheckSquare, X, BusFront, Check, Edit2 } from "lucide-react";

const inp: React.CSSProperties = { padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", width: "100%", boxSizing: "border-box" };
const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" };

export default function GestaoPassageiros({ viagemId, croquiConfig, passageiros: iniciais }: {
    viagemId: string;
    croquiConfig: any;
    passageiros: any[];
}) {
    const [passageiros, setPassageiros] = useState<any[]>(iniciais || []);
    const [poltronaSel, setPoltronaSel] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // Parse config — can arrive as string or object from JSON roundtrip
    const config = croquiConfig
        ? (typeof croquiConfig === "string" ? JSON.parse(croquiConfig) : croquiConfig)
        : null;

    async function recarregar() {
        const dados = await buscarPassageiros(viagemId);
        setPassageiros(dados);
    }

    function handleDocChange(e: React.ChangeEvent<HTMLInputElement>) {
        let v = e.target.value;
        if (e.target.name === "cpf") {
            v = v.replace(/\D/g, "");
            if (v.length > 11) v = v.substring(0, 11);
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d)/, "$1.$2");
            v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = v;
        } else if (e.target.name === "rg") {
            v = v.replace(/\D/g, "");
            if (v.length > 14) v = v.substring(0, 14);
            e.target.value = v;
        }
    }

    async function handleSalvar(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        const fd = new FormData(e.currentTarget);
        fd.set("viagemId", viagemId);
        fd.set("poltrona", poltronaSel!);
        const res = await adicionarPassageiro(fd);
        if (res?.erro) { alert(res.erro); setLoading(false); return; }
        await recarregar();
        setPoltronaSel(null);
        setLoading(false);
    }

    async function handleRemover(ocupado: any) {
        if (!window.confirm(`Remover ${ocupado.nome} da poltrona ${ocupado.poltrona}?`)) return;
        await removerPassageiro(ocupado.id, viagemId);
        await recarregar();
    }

    const totalAtivos = config
        ? ((config.piso1?.grid?.flat().filter(Boolean).length ?? 0) + (config.piso2?.grid?.flat().filter(Boolean).length ?? 0))
        : 0;

    function renderPiso(piso: any, titulo: string, inicioAssento: number) {
        if (!piso?.grid) return null;
        let contador = inicioAssento;

        return (
            <div style={{ background: "#f3f4f6", padding: "20px", borderRadius: "12px", border: "1px solid #d1d5db" }}>
                <p style={{ margin: "0 0 4px", textAlign: "center", fontWeight: "700", fontSize: "12px", color: "#374151", textTransform: "uppercase" }}>{titulo}</p>
                <p style={{ margin: "0 0 14px", textAlign: "center", fontSize: "10px", color: "#9ca3af", textTransform: "uppercase" }}>Verde = Livre · Vermelho = Ocupado</p>

                {/* Bus front */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", padding: "12px", border: "2px dashed #e5e7eb", borderRadius: "8px", backgroundColor: "#f9fafb" }}>
                    <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}><BusFront size={14} /> FRENTE</span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {piso.grid.map((row: boolean[], r: number) => (
                        <div key={r} style={{ display: "flex", gap: "5px" }}>
                            {row.map((isActive: boolean, c: number) => {
                                if (!isActive) {
                                    return <div key={`${r} -${c} `} style={{ width: "40px", height: "40px" }} />;
                                }

                                const numAtual = String(contador++);
                                const ocupado = passageiros.find(p => p.poltrona === numAtual);

                                return (
                                    <div
                                        key={`${r} -${c} `}
                                        onClick={() => ocupado ? handleRemover(ocupado) : setPoltronaSel(numAtual)}
                                        title={ocupado ? `✖ ${ocupado.nome} — clique para remover` : `Poltrona ${numAtual} · Livre — clique para alocar`}
                                        style={{
                                            width: "40px", height: "40px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            borderRadius: "6px 6px 2px 2px",
                                            fontSize: "11px", fontWeight: "800",
                                            cursor: "pointer", userSelect: "none",
                                            transition: "transform 0.1s, box-shadow 0.1s",
                                            ...(ocupado
                                                ? { background: "#fef2f2", border: "2px solid #dc2626", color: "#991b1b", boxShadow: "0 1px 3px rgba(220,38,38,0.25)" }
                                                : { background: "#f0fdf4", border: "2px solid #16a34a", color: "#166534", boxShadow: "0 1px 3px rgba(22,163,74,0.2)" }
                                            )
                                        }}
                                        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.08)"; }}
                                        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
                                    >
                                        {numAtual}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                <div style={{ background: "#e5e7eb", borderRadius: "0 0 8px 8px", height: "10px", marginTop: "8px" }} />
            </div>
        );
    }

    const totalPiso1 = config?.piso1?.grid?.flat().filter(Boolean).length ?? 0;

    if (!config) {
        return (
            <div style={{ padding: "48px", textAlign: "center", color: "#9ca3af", fontFamily: "sans-serif", background: "#f9fafb", borderRadius: "12px", border: "2px dashed #e5e7eb" }}>
                <div style={{ marginTop: "16px", padding: "16px", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e5e7eb", color: "#6b7280" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "#111827" }}>O croqui está vazio ou os assentos não foram configurados!</p>
                    <p style={{ fontSize: "13px", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>Aceda a <strong>Carros → <Edit2 size={12} /> Editar</strong> para configurar o mapa de assentos do veículo.</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "sans-serif" }}>

            {/* Stats strip */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {[
                    { label: "Total de Assentos", val: totalAtivos, bg: "#f8fafc", color: "#374151" },
                    { label: "Ocupados", val: passageiros.length, bg: "#fef2f2", color: "#dc2626" },
                    { label: "Livres", val: totalAtivos - passageiros.length, bg: "#f0fdf4", color: "#16a34a" },
                ].map(s => (
                    <div key={s.label} style={{ padding: "12px 20px", background: s.bg, borderRadius: "10px", border: "1px solid #e5e7eb", minWidth: "120px" }}>
                        <p style={{ margin: "0 0 2px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase" }}>{s.label}</p>
                        <p style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: s.color }}>{s.val}</p>
                    </div>
                ))}
            </div>

            {/* Seat maps */}
            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", justifyContent: "center", background: "#f0fdf4", padding: "24px", borderRadius: "12px", border: "2px dashed #86efac", overflowX: "auto" }}>
                {renderPiso(config.piso1, config.tipo === "van" ? "Croqui da Van" : "1º Andar", 1)}
                {config.tipo === "onibus" && config.andares === 2 && renderPiso(config.piso2, "2º Andar", totalPiso1 + 1)}
            </div>

            {/* Passenger list */}
            {passageiros.length > 0 && (
                <div style={{ background: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid #e5e7eb", background: "#f8fafc" }}>
                        <p style={{ margin: 0, fontSize: "12px", fontWeight: "800", color: "#374151", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                            <Users size={14} /> Passageiros Alocados
                        </p>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "#6b7280", padding: "4px 10px", backgroundColor: "#f3f4f6", borderRadius: "20px" }}>{passageiros.length} / {totalAtivos}</span>
                    </div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                {["Poltrona", "Nome", "RG", "CPF", ""].map(h => (
                                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {passageiros.sort((a, b) => Number(a.poltrona) - Number(b.poltrona)).map(p => (
                                <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "12px 16px" }}>
                                        <span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#fef2f2", border: "2px solid #dc2626", color: "#991b1b", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>{p.poltrona}</span>
                                    </td>
                                    <td style={{ padding: "12px 16px", fontWeight: "700", color: "#111827" }}>{p.nome}</td>
                                    <td style={{ padding: "12px 16px", color: "#6b7280", fontFamily: "monospace", fontSize: "12px" }}>{p.rg || "—"}</td>
                                    <td style={{ padding: "12px 16px", color: "#6b7280", fontFamily: "monospace", fontSize: "12px" }}>{p.cpf || "—"}</td>
                                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                                        <button onClick={() => handleRemover(p)} style={{ padding: "4px 8px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}><X size={12} /> Remover</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {poltronaSel && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.65)", zIndex: 99999, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <div style={{ background: "#fff", borderRadius: "16px", width: "420px", maxWidth: "92%", boxShadow: "0 25px 50px rgba(0,0,0,0.3)", overflow: "hidden", fontFamily: "sans-serif" }}>
                        <div style={{ padding: "16px 22px", background: "#16a34a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#fff" }}>🪑 Alocar Poltrona {poltronaSel}</h2>
                            <button onClick={() => setPoltronaSel(null)} style={{ background: "none", border: "none", color: "#bbf7d0", fontSize: "20px", cursor: "pointer" }}><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSalvar} style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={lbl}>Nome do Passageiro *</label>
                                <input type="text" name="nome" required autoFocus style={inp} placeholder="Nome completo" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div>
                                    <label style={lbl}>RG</label>
                                    <input type="text" name="rg" style={inp} placeholder="Opcional" onChange={handleDocChange} maxLength={14} />
                                </div>
                                <div>
                                    <label style={lbl}>CPF</label>
                                    <input type="text" name="cpf" style={inp} placeholder="Opcional" onChange={handleDocChange} maxLength={14} />
                                </div>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", paddingTop: "8px", borderTop: "1px solid #e5e7eb" }}>
                                <button type="button" onClick={() => setPoltronaSel(null)} style={{ padding: "8px 18px", background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer" }}>Cancelar</button>
                                <button type="submit" disabled={loading} style={{ padding: "8px 22px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "13px", cursor: "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", gap: "6px" }}>
                                    {loading ? "Salvando..." : <><Check size={14} /> Confirmar</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

"use client";
import React, { useState } from "react";
import { BusFront, Lightbulb } from "lucide-react";
type PisoMatrix = { layout: string; linhas: number; colunas: number; grid: boolean[][] };
type ConfigCroqui = { tipo: string; andares: number; piso1: PisoMatrix; piso2?: PisoMatrix };

const gerarGrid = (layout: string, linhas: number, tipo: string): boolean[][] => {
    const grid: boolean[][] = [];
    for (let r = 0; r < linhas; r++) {
        if (tipo === "van") {
            grid.push([true, true, true, true]);
        } else if (layout === "2-2") {
            grid.push([true, true, false, true, true]);
        } else {
            grid.push([true, true, false, true]);
        }
    }
    return grid;
};

const DEFAULT_CONFIG: ConfigCroqui = {
    tipo: "onibus",
    andares: 1,
    piso1: { layout: "2-2", linhas: 10, colunas: 5, grid: gerarGrid("2-2", 10, "onibus") },
    piso2: { layout: "2-2", linhas: 12, colunas: 5, grid: gerarGrid("2-2", 12, "onibus") }
};

export default function GeradorCroqui({ configInicial }: { configInicial?: any }) {
    const [config, setConfig] = useState<ConfigCroqui>(configInicial || DEFAULT_CONFIG);

    const handleTipoChange = (novoTipo: string) => {
        setConfig({
            tipo: novoTipo,
            andares: 1,
            piso1: {
                layout: novoTipo === "van" ? "van" : "2-2",
                linhas: novoTipo === "van" ? 5 : 10,
                colunas: novoTipo === "van" ? 4 : 5,
                grid: gerarGrid(novoTipo === "van" ? "van" : "2-2", novoTipo === "van" ? 5 : 10, novoTipo)
            }
        });
    };

    const handlePisoChange = (pisoKey: "piso1" | "piso2", field: string, value: any) => {
        const novoPiso = { ...config[pisoKey]!, [field]: value };
        novoPiso.grid = gerarGrid(novoPiso.layout, novoPiso.linhas, config.tipo);
        setConfig({ ...config, [pisoKey]: novoPiso });
    };

    const handleAndares = (n: number) => {
        setConfig({
            ...config,
            andares: n,
            piso2: n === 2
                ? { layout: "2-2", linhas: 10, colunas: 5, grid: gerarGrid("2-2", 10, "onibus") }
                : undefined
        });
    };

    const toggleAssento = (pisoKey: "piso1" | "piso2", r: number, c: number) => {
        const novoGrid = config[pisoKey]!.grid.map((row, ri) =>
            ri === r ? row.map((val, ci) => ci === c ? !val : val) : [...row]
        );
        setConfig({ ...config, [pisoKey]: { ...config[pisoKey]!, grid: novoGrid } });
    };

    const totalPiso1 = config.piso1.grid.flat().filter(Boolean).length;

    const renderPiso = (pisoKey: "piso1" | "piso2", titulo: string, inicioAssento: number) => {
        const piso = config[pisoKey];
        if (!piso) return null;
        let contador = inicioAssento;

        return (
            <div style={{ background: "#f3f4f6", padding: "20px", borderRadius: "12px", border: "1px solid #d1d5db" }}>
                <p style={{ margin: "0 0 4px 0", textAlign: "center", fontWeight: "700", fontSize: "12px", color: "#374151", textTransform: "uppercase" }}>{titulo}</p>
                <p style={{ margin: "0 0 14px 0", textAlign: "center", fontSize: "10px", color: "#9ca3af", textTransform: "uppercase" }}>Clique para ativar / desativar slot</p>

                {/* Front strip */}
                <div style={{ background: "#374151", borderRadius: "8px 8px 0 0", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "8px" }}>
                    <span style={{ color: "#9ca3af", fontSize: "10px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                        <BusFront size={12} /> {config.tipo === "van" ? "FRENTE" : "FRENTE DO VEÍCULO"}
                    </span>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    {piso.grid.map((row, r) => (
                        <div key={r} style={{ display: "flex", gap: "5px" }}>
                            {row.map((isActive, c) => {
                                const num = isActive ? contador++ : null;
                                const isAisle = !isActive && !configInicial; // initial aisle slots
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        onClick={() => toggleAssento(pisoKey, r, c)}
                                        title={isActive ? `Assento ${num}` : "Slot vazio — clique para ativar"}
                                        style={{
                                            width: "40px", height: "40px",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            borderRadius: "6px 6px 2px 2px",
                                            fontSize: "11px", fontWeight: "700",
                                            cursor: "pointer",
                                            transition: "all 0.12s",
                                            userSelect: "none",
                                            ...(isActive
                                                ? { background: "#fff", border: "2px solid #ec4899", color: "#374151", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }
                                                : { background: "#e5e7eb", border: "2px dashed #9ca3af", color: "transparent" }
                                            )
                                        }}
                                    >
                                        {num ?? "·"}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Back strip */}
                <div style={{ background: "#e5e7eb", borderRadius: "0 0 8px 8px", height: "12px", marginTop: "8px" }} />

                <p style={{ margin: "10px 0 0 0", textAlign: "center", fontSize: "11px", color: "#6b7280" }}>
                    <strong>{piso.grid.flat().filter(Boolean).length}</strong> assentos ativos
                </p>
            </div>
        );
    };

    // Shared label + select/input style helpers
    const lbl: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "4px" };
    const ctrl: React.CSSProperties = { padding: "7px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "13px", backgroundColor: "#f9fafb", color: "#374151" };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input type="hidden" name="croqui_config" value={JSON.stringify(config)} />

            {/* ─── Controls bar ─── */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", alignItems: "flex-end", padding: "16px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                <div>
                    <label style={lbl}>Tipo de Veículo</label>
                    <select style={ctrl} value={config.tipo} onChange={e => handleTipoChange(e.target.value)}>
                        <option value="onibus">Ônibus</option>
                        <option value="van">Van</option>
                    </select>
                </div>

                {config.tipo === "onibus" && (
                    <>
                        <div>
                            <label style={lbl}>Andares</label>
                            <select style={ctrl} value={config.andares} onChange={e => handleAndares(Number(e.target.value))}>
                                <option value={1}>1 Andar</option>
                                <option value={2}>Double Decker (2)</option>
                            </select>
                        </div>
                        <div>
                            <label style={lbl}>Layout Piso 1</label>
                            <select style={ctrl} value={config.piso1.layout} onChange={e => handlePisoChange("piso1", "layout", e.target.value)}>
                                <option value="2-2">Convencional (2-2)</option>
                                <option value="2-1">Leito / Semileito (2-1)</option>
                            </select>
                        </div>
                    </>
                )}

                <div>
                    <label style={lbl}>Fileiras{config.andares === 2 ? " (Piso 1)" : ""}</label>
                    <input type="number" min="1" max="30" style={{ ...ctrl, width: "72px", textAlign: "center", fontWeight: "700" }}
                        value={config.piso1.linhas}
                        onChange={e => handlePisoChange("piso1", "linhas", Number(e.target.value) || 1)} />
                </div>

                {config.tipo === "onibus" && config.andares === 2 && (
                    <>
                        <div style={{ width: "1px", background: "#e5e7eb", alignSelf: "stretch" }} />
                        <div>
                            <label style={lbl}>Layout Piso 2</label>
                            <select style={ctrl} value={config.piso2?.layout || "2-2"} onChange={e => handlePisoChange("piso2", "layout", e.target.value)}>
                                <option value="2-2">Convencional (2-2)</option>
                                <option value="2-1">Leito / Semileito (2-1)</option>
                            </select>
                        </div>
                        <div>
                            <label style={lbl}>Fileiras (Piso 2)</label>
                            <input type="number" min="1" max="30" style={{ ...ctrl, width: "72px", textAlign: "center", fontWeight: "700" }}
                                value={config.piso2?.linhas ?? ""}
                                onChange={e => handlePisoChange("piso2", "linhas", Number(e.target.value) || 1)} />
                        </div>
                    </>
                )}

                <div style={{ marginLeft: "auto", padding: "7px 12px", background: "#fef3c7", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "12px", color: "#92400e" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Lightbulb size={16} /> Clique nos slots para ativar/desativar
                    </div>
                </div>
            </div>

            {/* ─── Visual editor ─── */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", justifyContent: "center", background: "#f0fdf4", padding: "24px", borderRadius: "12px", border: "2px dashed #86efac", overflowX: "auto", minHeight: "200px", alignItems: "flex-start" }}>
                {renderPiso("piso1", config.tipo === "van" ? "Croqui da Van" : "1º Andar", 1)}
                {config.tipo === "onibus" && config.andares === 2 && renderPiso("piso2", "2º Andar", totalPiso1 + 1)}
            </div>

            <p style={{ margin: 0, textAlign: "center", fontSize: "12px", color: "#6b7280" }}>
                Total: <strong>{totalPiso1 + (config.tipo === "onibus" && config.andares === 2 ? (config.piso2?.grid.flat().filter(Boolean).length ?? 0) : 0)}</strong> assento(s) configurado(s)
            </p>
        </div>
    );
}

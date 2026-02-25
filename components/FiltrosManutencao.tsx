"use client";
import React, { useRef, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function FiltrosManutencao({ veiculos }: { veiculos: any[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);

    const TIPOS = [
        "Revisão Geral", "Troca de Óleo", "Troca de Pneus", "Freios", "Suspensão",
        "Elétrica", "Funilaria / Pintura", "Ar-condicionado", "Motor", "Câmbio",
        "Embreagem", "Injeção Eletrônica", "Limpeza / Higienização", "Outro"
    ];

    const [tiposAbertos, setTiposAbertos] = useState(false);
    const [tiposSelecionados, setTiposSelecionados] = useState<string[]>(searchParams.getAll("tipo") || []);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setTiposAbertos(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const params = new URLSearchParams();

        const fields = ["inicio", "fim", "veiculoId", "fornecedor", "status"];
        fields.forEach(f => {
            const val = fd.get(f) as string;
            if (val && val.trim() !== "") params.set(f, val.trim());
        });

        tiposSelecionados.forEach(t => {
            params.append("tipo", t);
        });

        router.push(`${pathname}?${params.toString()}`);
    };

    const clear = () => {
        formRef.current?.reset();
        setTiposSelecionados([]);
        router.push(pathname);
    };

    const inp = { padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", outline: "none", backgroundColor: "#fff" };
    const lbl = { display: "block", fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" as const, marginBottom: "4px" };


    return (
        <form ref={formRef} onSubmit={onSubmit} style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "24px" }}>

            <div style={{ display: "flex", gap: "8px" }}>
                <div>
                    <label style={lbl}>Data Início</label>
                    <input type="date" name="inicio" defaultValue={searchParams.get("inicio") || ""} style={inp} />
                </div>
                <div>
                    <label style={lbl}>Data Fim</label>
                    <input type="date" name="fim" defaultValue={searchParams.get("fim") || ""} style={inp} />
                </div>
            </div>

            <div>
                <label style={lbl}>Veículo</label>
                <select name="veiculoId" defaultValue={searchParams.get("veiculoId") || ""} style={inp}>
                    <option value="">Todos</option>
                    {veiculos.map(v => <option key={v.id} value={v.id}>{v.prefixo}</option>)}
                </select>
            </div>

            <div>
                <label style={lbl}>Fornecedor</label>
                <input type="text" name="fornecedor" defaultValue={searchParams.get("fornecedor") || ""} placeholder="Nome da oficina..." style={{ ...inp, width: "150px" }} />
            </div>

            {/* Custom Multi-Select para Tipos */}
            <div ref={dropdownRef} style={{ position: "relative" }}>
                <label style={lbl}>Tipos de Manutenção</label>
                <div
                    onClick={() => setTiposAbertos(!tiposAbertos)}
                    style={{ ...inp, minWidth: "160px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                    <span style={{ color: tiposSelecionados.length > 0 ? "#111827" : "#9ca3af" }}>
                        {tiposSelecionados.length > 0 ? `${tiposSelecionados.length} selecionado(s)` : "Selecionar..."}
                    </span>
                    <span style={{ fontSize: "10px" }}>▼</span>
                </div>

                {tiposAbertos && (
                    <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "4px", width: "240px", maxHeight: "280px", overflowY: "auto", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)", zIndex: 50, padding: "8px" }}>
                        {TIPOS.map(t => (
                            <label key={t} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 8px", cursor: "pointer", borderRadius: "6px", backgroundColor: tiposSelecionados.includes(t) ? "#f3e8ff" : "transparent" }}>
                                <input
                                    type="checkbox"
                                    checked={tiposSelecionados.includes(t)}
                                    onChange={(e) => {
                                        if (e.target.checked) setTiposSelecionados([...tiposSelecionados, t]);
                                        else setTiposSelecionados(tiposSelecionados.filter(item => item !== t));
                                    }}
                                    style={{ accentColor: "#7c3aed" }}
                                />
                                <span style={{ fontSize: "13px", color: tiposSelecionados.includes(t) ? "#7c3aed" : "#374151", fontWeight: tiposSelecionados.includes(t) ? "600" : "400" }}>{t}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label style={lbl}>Status</label>
                <select name="status" defaultValue={searchParams.get("status") || ""} style={inp}>
                    <option value="">Todos</option>
                    <option value="pago">Pago</option>
                    <option value="pendente">Pendente</option>
                </select>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
                <button type="submit" style={{ padding: "6px 14px", backgroundColor: "#111827", color: "#fff", border: "none", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                    Filtrar
                </button>
                {Array.from(searchParams.keys()).length > 0 && (
                    <button type="button" onClick={clear} style={{ padding: "6px 14px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "12px", fontWeight: "700", cursor: "pointer" }}>
                        Limpar
                    </button>
                )}
            </div>
        </form>
    );
}

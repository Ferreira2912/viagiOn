"use client";
import React, { useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export default function FiltrosMultas({ veiculos, motoristas }: { veiculos: any[], motoristas: any[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const params = new URLSearchParams();

        const fields = ["inicio", "fim", "veiculoId", "motoristaId", "status"];
        fields.forEach(f => {
            const val = fd.get(f) as string;
            if (val && val.trim() !== "") params.set(f, val.trim());
        });

        router.push(`${pathname}?${params.toString()}`);
    };

    const clear = () => {
        formRef.current?.reset();
        router.push(pathname);
    };

    const inp = { padding: "6px 10px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "12px", outline: "none" };
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
                <label style={lbl}>Motorista</label>
                <select name="motoristaId" defaultValue={searchParams.get("motoristaId") || ""} style={inp}>
                    <option value="">Todos</option>
                    {motoristas.map(m => <option key={m.id} value={m.id}>{m.nome_completo.split(" ")[0]}</option>)}
                </select>
            </div>

            <div>
                <label style={lbl}>Status</label>
                <select name="status" defaultValue={searchParams.get("status") || ""} style={inp}>
                    <option value="">Todos</option>
                    <option value="pago">Pago / Descontado</option>
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

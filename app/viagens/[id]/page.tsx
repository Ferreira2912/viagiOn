import prisma from "../../../lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import GestaoPassageiros from "../../../components/GestaoPassageiros";
import { getSession } from "../../../lib/auth";
import { Map, Printer, Edit2, Users, CalendarDays, Calendar, DollarSign, Banknote } from "lucide-react";

export default async function ViagemDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const viagemRaw = await prisma.viagem.findUnique({
        where: { id },
        include: {
            veiculo: true,
            motorista1: true,
            motorista2: true,
            passageiros: { orderBy: { poltrona: "asc" } },
            roteiros: { orderBy: { data: "asc" } },
            fornecedores: true,
        }
    });

    if (!viagemRaw) return notFound();

    // JSON roundtrip serializes Decimal (valor_pacote, fornecedores.valor) and Date fields
    const viagem: any = JSON.parse(JSON.stringify(viagemRaw));

    function fmtDate(d: string | null) {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("pt-BR");
    }

    const totalPassageiros = viagem.passageiros.length;
    const custoTotal = viagem.fornecedores.reduce((acc: number, f: any) => acc + Number(f.valor), 0);

    return (
        <div style={{ fontFamily: "sans-serif" }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: "20px" }}>
                <Link href="/viagens" style={{ color: "#6b7280", fontSize: "13px", textDecoration: "none" }}>← Voltar para Viagens</Link>
            </div>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
                <div>
                    {viagem.codigo_interno && <p style={{ margin: "0 0 2px", fontSize: "12px", color: "#9ca3af", fontFamily: "monospace" }}>{viagem.codigo_interno}</p>}
                    <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Map size={24} /> {viagem.nome_viagem}
                    </h1>
                    <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>
                        {fmtDate(viagem.data_partida)} → {fmtDate(viagem.data_retorno)}
                        {viagem.veiculo && <> · <strong>{viagem.veiculo.prefixo}</strong></>}
                        {viagem.motorista1 && <> · {viagem.motorista1.nome_completo.split(" ")[0]}</>}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{
                        padding: "4px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "700",
                        backgroundColor: viagem.status === "CONCLUIDA" ? "#f0fdf4" : viagem.status === "CANCELADA" ? "#fef2f2" : "#eff6ff",
                        color: viagem.status === "CONCLUIDA" ? "#16a34a" : viagem.status === "CANCELADA" ? "#dc2626" : "#2563eb",
                        border: "1px solid currentColor"
                    }}>
                        {viagem.status}
                    </span>
                    <Link href={`/ viagens / ${id}/imprimir`} target="_blank" style={{ padding: "6px 14px", background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "12px", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Printer size={16} /> Imprimir
                    </Link >
                    <Link href={`/viagens/${id}/editar`} style={{ padding: "6px 16px", background: "#111827", color: "#fff", borderRadius: "8px", fontSize: "12px", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Edit2 size={16} /> Editar Dados
                    </Link>
                </div >
            </div >

            {/* Quick stats */}
            < div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", marginBottom: "28px" }}>
                {
                    [
                        { label: "Passageiros", val: `${totalPassageiros}${viagem.qtd_passageiros ? `/${viagem.qtd_passageiros}` : ""}`, icon: <Users size={32} color="#1d4ed8" /> },
                        { label: "Dias / Noites", val: viagem.qtd_dias ? `${viagem.qtd_dias}d / ${viagem.qtd_noites ?? "?"}n` : "—", icon: <CalendarDays size={32} color="#16a34a" /> },
                        { label: "Roteiro", val: `${viagem.roteiros.length} dia(s)`, icon: <Calendar size={32} color="#d97706" /> },
                        { label: "Custo Total", val: `R$ ${custoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: <DollarSign size={32} color="#7c3aed" /> },
                        { label: "Valor Pacote", val: viagem.valor_pacote ? `R$ ${Number(viagem.valor_pacote).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—", icon: <Banknote size={32} color="#0891b2" /> },
                    ].map(s => (
                        <div key={s.label} style={{ padding: "14px 16px", background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}>
                            <p style={{ margin: "0 0 4px", fontSize: "11px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "8px" }}>{s.icon} {s.label}</p>
                            <p style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#111827" }}>{s.val}</p>
                        </div>
                    ))
                }
            </div >

            {/* Seat map section */}
            < div style={{ marginBottom: "16px" }}>
                <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800", color: "#111827" }}>🪑 Mapa de Assentos</h2>
                <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>Clique num assento verde para alocar um passageiro. Clique num vermelho para remover.</p>
            </div >

            <GestaoPassageiros
                viagemId={viagem.id}
                croquiConfig={viagem.veiculo?.croqui_config ?? null}
                passageiros={viagem.passageiros}
            />
        </div >
    );
}

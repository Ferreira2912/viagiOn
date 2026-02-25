import prisma from "../lib/prisma";
import { getSession } from "../lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Bus, Map, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const empresaId = session.empresaId as string;

    const hoje = new Date();
    hoje.setUTCHours(0, 0, 0, 0);

    const dataAlerta = new Date();
    dataAlerta.setDate(dataAlerta.getDate() + 15);

    const [proximasViagensRaw, alertasManutencao, totalVeiculos] = await Promise.all([
        prisma.viagem.findMany({
            where: { empresaId, data_partida: { gte: hoje }, status: { not: "CANCELADA" } },
            orderBy: { data_partida: 'asc' },
            take: 8,
            include: { veiculo: true, motorista1: true }
        }),
        prisma.manutencao.count({
            where: { empresaId, pago: false }
        }),
        prisma.veiculo.count({ where: { empresaId, status: "ATIVO" } })
    ]);

    const proximasViagens: any[] = JSON.parse(JSON.stringify(proximasViagensRaw));

    function fmtDate(d: string | null | undefined) {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "sans-serif" }}>

            <div style={{ paddingBottom: "16px", borderBottom: "1px solid #e5e7eb" }}>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                    <LayoutDashboard size={24} /> Dashboard
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280" }}>Visão geral da frota e viagens.</p>
            </div>

            {/* CARDS KPI */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", borderLeft: "4px solid #3b82f6", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#eff6ff" }}>
                        <Bus size={24} color="#3b82f6" />
                    </div>
                    <div>
                        <p style={{ margin: "0", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Frota Ativa</p>
                        <h3 style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: "900", color: "#111827" }}>{totalVeiculos} Veículos</h3>
                    </div>
                </div>

                <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", borderLeft: "4px solid #10b981", display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", backgroundColor: "#ecfdf5" }}>
                        <Map size={24} color="#10b981" />
                    </div>
                    <div>
                        <p style={{ margin: "0", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Próximas Viagens</p>
                        <h3 style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: "900", color: "#111827" }}>{proximasViagens.length} Agendadas</h3>
                    </div>
                </div>

                <Link href="/manutencoes" style={{ textDecoration: "none", backgroundColor: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 1px 2px rgba(0,0,0,0.05)", border: "1px solid #e5e7eb", borderLeft: alertasManutencao > 0 ? "4px solid #ef4444" : "4px solid #d1d5db", display: "flex", alignItems: "center", gap: "16px", transition: "all 0.2s" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "48px", height: "48px", borderRadius: "12px", backgroundColor: alertasManutencao > 0 ? "#fef2f2" : "#f3f4f6" }}>
                        <AlertTriangle size={24} color={alertasManutencao > 0 ? "#ef4444" : "#9ca3af"} />
                    </div>
                    <div>
                        <p style={{ margin: "0", fontSize: "12px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Alertas Manutenção</p>
                        <h3 style={{ margin: "4px 0 0", fontSize: "24px", fontWeight: "900", color: alertasManutencao > 0 ? "#ef4444" : "#111827" }}>{alertasManutencao} Pendências</h3>
                    </div>
                </Link>
            </div>

            {/* TABELA PRÓXIMAS VIAGENS */}
            <div style={{ backgroundColor: "#fff", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                <div style={{ padding: "16px 24px", borderBottom: "1px solid #e5e7eb", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#111827", textTransform: "uppercase", letterSpacing: "0.05em" }}>Próximas Viagens</h3>
                    <Link href="/viagens" style={{ fontSize: "13px", fontWeight: "700", color: "#3b82f6", textDecoration: "none" }}>Ver todas →</Link>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "1px solid #e5e7eb" }}>
                            <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Data</th>
                            <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Destino</th>
                            <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Veículo / Motorista</th>
                            <th style={{ padding: "12px 24px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {proximasViagens.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#6b7280" }}>Nenhuma viagem futura encontrada.</td></tr>
                        ) : proximasViagens.map(v => (
                            <tr key={v.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "16px 24px", color: "#111827", fontWeight: "600", whiteSpace: "nowrap" }}>
                                    {fmtDate(v.data_partida)}
                                </td>
                                <td style={{ padding: "16px 24px", color: "#111827", fontWeight: "700" }}>{v.nome_viagem}</td>
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ fontWeight: "700", color: "#374151" }}>{v.veiculo?.prefixo || "Sem Veículo"}</div>
                                    <div style={{ fontSize: "11px", color: "#6b7280" }}>{v.motorista1?.nome_completo?.split(" ")[0] || "Sem Motorista"}</div>
                                </td>
                                <td style={{ padding: "16px 24px" }}>
                                    <span style={{ padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "800", backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
                                        {v.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

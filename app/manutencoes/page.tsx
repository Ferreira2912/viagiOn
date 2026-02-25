import prisma from "../../lib/prisma";
import ModalManutencao from "../../components/ModalManutencao";
import { getSession } from "../../lib/auth";
import { redirect } from "next/navigation";
import FiltrosManutencao from "../../components/FiltrosManutencao";
import { Wrench, CheckCircle2, Clock, CalendarDays } from "lucide-react";

export default async function ManutencoesPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const sp = await searchParams;
    const where: any = { empresaId: session.empresaId as string };

    if (sp.inicio || sp.fim) {
        where.data_manutencao = {};
        if (sp.inicio) where.data_manutencao.gte = new Date((sp.inicio as string) + "T00:00:00Z");
        if (sp.fim) where.data_manutencao.lte = new Date((sp.fim as string) + "T23:59:59Z");
    }
    if (sp.veiculoId) where.veiculoId = sp.veiculoId;
    if (sp.fornecedor) where.fornecedor = { contains: sp.fornecedor as string, mode: "insensitive" };
    if (sp.tipo) {
        const tipos = Array.isArray(sp.tipo) ? sp.tipo : [sp.tipo];
        where.tipo_manutencao = { in: tipos };
    }
    if (sp.status === "pago") where.pago = true;
    if (sp.status === "pendente") where.pago = false;

    const [rawManutencoes, veiculosRaw] = await Promise.all([
        prisma.manutencao.findMany({
            where,
            orderBy: { data_manutencao: "desc" },
            include: { veiculo: true }
        }),
        prisma.veiculo.findMany({ where: { empresaId: session.empresaId as string }, orderBy: { prefixo: "asc" } })
    ]);

    const manutencoes: any[] = JSON.parse(JSON.stringify(rawManutencoes));
    const veiculos: any[] = JSON.parse(JSON.stringify(veiculosRaw));

    function fmtDate(d: string | null | undefined) {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Wrench size={24} /> Manutenções da Frota
                    </h1>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                        {manutencoes.length} registro(s) • {manutencoes.filter(m => !m.pago).length} pendente(s) de pagamento
                    </p>
                </div>
                <ModalManutencao veiculos={veiculos} />
            </div>

            <FiltrosManutencao veiculos={veiculos} />

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: "sans-serif" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                            {["Data", "Veículo", "Fornecedor", "Tipo", "KM", "Descrição", "Status", ""].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {manutencoes.map((m) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                <td style={{ padding: "14px 16px", color: "#374151", whiteSpace: "nowrap" }}>
                                    {fmtDate(m.data_manutencao)}
                                </td>
                                <td style={{ padding: "14px 16px", fontWeight: "700", color: "#111827" }}>
                                    <div>{m.veiculo?.prefixo || "—"}</div>
                                    <div style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>{m.veiculo?.placa}</div>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#374151" }}>{m.fornecedor}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{ padding: "3px 10px", backgroundColor: "#f3e8ff", color: "#7c3aed", borderRadius: "20px", fontSize: "11px", fontWeight: "700" }}>
                                        {m.tipo_manutencao}
                                    </span>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#6b7280", fontFamily: "monospace", fontSize: "12px" }}>
                                    {m.quilometragem ? `${m.quilometragem.toLocaleString("pt-BR")} km` : "—"}
                                </td>
                                <td style={{ padding: "14px 16px", color: "#6b7280", maxWidth: "220px" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "200px" }}>
                                        {m.descricao || "—"}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                        <span style={{
                                            padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px",
                                            backgroundColor: m.pago ? "#f0fdf4" : "#fef2f2",
                                            color: m.pago ? "#16a34a" : "#dc2626"
                                        }}>
                                            {m.pago ? <><CheckCircle2 size={12} /> Pago</> : <><Clock size={12} /> Pendente</>}
                                        </span>
                                        {m.agendar_proxima && (
                                            <span style={{ padding: "2px 8px", borderRadius: "12px", fontSize: "11px", fontWeight: "700", backgroundColor: "#fffbeb", color: "#d97706", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                                <CalendarDays size={12} /> Agendar
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                    <ModalManutencao veiculos={veiculos} manutencao={m} isEdit={true} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {manutencoes.length === 0 && (
                    <div style={{ padding: "48px", textAlign: "center", color: "#9ca3af", fontFamily: "sans-serif" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                            <Wrench size={40} color="#9ca3af" />
                        </div>
                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>Nenhuma manutenção registrada</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Clique em "+ Nova Manutenção" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

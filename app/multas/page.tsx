import prisma from "../../lib/prisma";
import ModalMulta from "../../components/ModalMulta";
import { getSession } from "../../lib/auth";
import { redirect } from "next/navigation";
import FiltrosMultas from "../../components/FiltrosMultas";
import { Siren, CheckCircle2, Clock } from "lucide-react";

export default async function MultasPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const sp = await searchParams;
    const where: any = { empresaId: session.empresaId as string };

    if (sp.inicio || sp.fim) {
        where.data_infracao = {};
        if (sp.inicio) where.data_infracao.gte = new Date((sp.inicio as string) + "T00:00:00Z");
        if (sp.fim) where.data_infracao.lte = new Date((sp.fim as string) + "T23:59:59Z");
    }
    if (sp.veiculoId) where.veiculoId = sp.veiculoId;
    if (sp.motoristaId) where.motoristaId = sp.motoristaId;
    if (sp.status === "pago") where.pago_descontado = true;
    if (sp.status === "pendente") where.pago_descontado = false;

    const [multasRaw, veiculosRaw, motoristasRaw] = await Promise.all([
        prisma.multa.findMany({
            where,
            include: { veiculo: true, motorista: true },
            orderBy: { data_infracao: "desc" }
        }),
        prisma.veiculo.findMany({ where: { empresaId: session.empresaId as string }, orderBy: { prefixo: "asc" } }),
        prisma.motorista.findMany({ where: { empresaId: session.empresaId as string }, orderBy: { nome_completo: "asc" } })
    ]);

    // JSON roundtrip serializes Decimal (valor) and all Date fields
    const multas: any[] = JSON.parse(JSON.stringify(multasRaw));
    const veiculos: any[] = JSON.parse(JSON.stringify(veiculosRaw));
    const motoristas: any[] = JSON.parse(JSON.stringify(motoristasRaw));

    const totalValor = multas.reduce((acc: number, m: any) => acc + (Number(m.valor) || 0), 0);
    const pendentes = multas.filter((m: any) => !m.pago_descontado).length;

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
                        <Siren size={24} /> Multas e Infrações
                    </h1>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                        {multas.length} registro(s) • {pendentes} pendente(s) •&nbsp;
                        Total: <strong style={{ color: "#dc2626" }}>R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </p>
                </div>
                <ModalMulta veiculos={veiculos} motoristas={motoristas} />
            </div>

            <FiltrosMultas veiculos={veiculos} motoristas={motoristas} />

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: "sans-serif" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                            {["Data", "Veículo", "Motorista", "Valor / Pontos", "Descrição", "Status", ""].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {multas.map((m: any) => (
                            <tr key={m.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                <td style={{ padding: "14px 16px", color: "#374151", whiteSpace: "nowrap" }}>
                                    {fmtDate(m.data_infracao)}
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <div style={{ fontWeight: "700", color: "#111827" }}>{m.veiculo?.prefixo}</div>
                                    <div style={{ fontSize: "11px", color: "#9ca3af", fontFamily: "monospace" }}>{m.veiculo?.placa}</div>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#374151" }}>{m.motorista?.nome_completo}</td>
                                <td style={{ padding: "14px 16px", whiteSpace: "nowrap" }}>
                                    <div style={{ fontWeight: "700", color: "#dc2626" }}>
                                        R$ {Number(m.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                    </div>
                                    {m.pontos_cnh > 0 && (
                                        <div style={{ fontSize: "11px", color: "#f97316", fontWeight: "700" }}>
                                            {m.pontos_cnh} ponto{m.pontos_cnh !== 1 ? "s" : ""} na CNH
                                        </div>
                                    )}
                                </td>
                                <td style={{ padding: "14px 16px", color: "#6b7280", maxWidth: "240px" }}>
                                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "220px" }}>
                                        {m.descricao}
                                    </div>
                                </td>
                                <td style={{ padding: "14px 16px" }}>
                                    <span style={{
                                        padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px",
                                        backgroundColor: m.pago_descontado ? "#f0fdf4" : "#fef2f2",
                                        color: m.pago_descontado ? "#16a34a" : "#dc2626"
                                    }}>
                                        {m.pago_descontado ? <><CheckCircle2 size={12} /> Pago/Descontado</> : <><Clock size={12} /> Pendente</>}
                                    </span>
                                </td>
                                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                    <ModalMulta veiculos={veiculos} motoristas={motoristas} multa={m} isEdit={true} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {multas.length === 0 && (
                    <div style={{ padding: "48px", textAlign: "center", color: "#9ca3af", fontFamily: "sans-serif" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                            <Siren size={40} color="#9ca3af" />
                        </div>
                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>Nenhuma multa registrada</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Clique em "+ Nova Multa" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

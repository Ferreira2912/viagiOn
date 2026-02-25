import prisma from "../../lib/prisma";
import ModalVeiculo from "../../components/ModalVeiculo";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bus } from "lucide-react";

export default async function VeiculosPage() {
    // 1. Puxa o crachá do usuário logado
    const session = await getSession();
    if (!session) redirect("/login");

    // 2. Busca APENAS os veículos da empresa dele e corrige o criado_em
    const rawVeiculos = await prisma.veiculo.findMany({
        where: { empresaId: session.empresaId },
        orderBy: { criado_em: "desc" }
    });

    // JSON roundtrip converte Decimal e Date para tipos simples (compatível com Client Components)
    const veiculos: any[] = JSON.parse(JSON.stringify(rawVeiculos));

    function fmtDate(d: string | null | undefined) {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("pt-BR");
    }

    function isExpiring(d: string | null | undefined): boolean {
        if (!d) return false;
        const diff = new Date(d).getTime() - Date.now();
        return diff < 60 * 24 * 60 * 60 * 1000; // 60 dias
    }

    // O seu return ( HTML ) começa logo aqui embaixo...

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Bus size={24} /> Gestão de Frota
                    </h1>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>{veiculos.length} veículo(s) cadastrado(s)</p>
                </div>
                <ModalVeiculo />
            </div>

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: "sans-serif" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                            {["Prefixo", "Placa", "Tipo", "Lugares", "Cor (Calendário)", "Seguro", "ANTT", "IPVA", ""].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {veiculos.map((v) => (
                            <tr key={v.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                <td style={{ padding: "14px 16px", fontWeight: "700", color: "#111827" }}>{v.prefixo}</td>
                                <td style={{ padding: "14px 16px", color: "#374151" }}>
                                    <span style={{ backgroundColor: "#f3f4f6", padding: "3px 8px", borderRadius: "6px", fontFamily: "monospace", fontSize: "12px" }}>{v.placa}</span>
                                </td>
                                <td style={{ padding: "14px 16px", color: "#6b7280" }}>{v.tipo_veiculo || "—"}</td>
                                <td style={{ padding: "14px 16px", color: "#6b7280", textAlign: "center" }}>{v.lugares || "—"}</td>
                                <td style={{ padding: "14px 16px" }}>
                                    {v.cor_veiculo ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div style={{ width: "20px", height: "20px", borderRadius: "4px", backgroundColor: v.cor_veiculo, border: "1px solid rgba(0,0,0,0.15)", flexShrink: 0 }} />
                                            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#374151" }}>{v.cor_veiculo}</span>
                                        </div>
                                    ) : <span style={{ color: "#d1d5db" }}>—</span>}
                                </td>
                                <td style={{ padding: "14px 16px", color: isExpiring(v.seguro_data) ? "#dc2626" : "#6b7280", fontWeight: isExpiring(v.seguro_data) ? "700" : "400" }}>
                                    {fmtDate(v.seguro_data)}
                                </td>
                                <td style={{ padding: "14px 16px", color: isExpiring(v.antt_data) ? "#dc2626" : "#6b7280", fontWeight: isExpiring(v.antt_data) ? "700" : "400" }}>
                                    {fmtDate(v.antt_data)}
                                </td>
                                <td style={{ padding: "14px 16px", color: isExpiring(v.ipva_data) ? "#dc2626" : "#6b7280", fontWeight: isExpiring(v.ipva_data) ? "700" : "400" }}>
                                    {fmtDate(v.ipva_data)}
                                </td>
                                <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                    <ModalVeiculo veiculo={v} isEdit={true} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {veiculos.length === 0 && (
                    <div style={{ padding: "48px", textAlign: "center", color: "#9ca3af", fontFamily: "sans-serif" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                            <Bus size={40} color="#9ca3af" />
                        </div>
                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>Nenhum veículo cadastrado</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Clique em "+ Novo Carro" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

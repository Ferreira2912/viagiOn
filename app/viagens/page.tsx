import prisma from "../../lib/prisma";
import Link from "next/link";
import { getSession } from "../../lib/auth";
import { redirect } from "next/navigation";
import FiltrosViagem from "../../components/FiltrosViagem";
import { Map, Printer, Edit2 } from "lucide-react";

export default async function ViagensPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const sp = await searchParams;

    let where: any = { empresaId: session.empresaId as string };

    if (sp.q) {
        const query = sp.q as string;
        where = {
            ...where,
            OR: [
                { nome_viagem: { contains: query, mode: "insensitive" } },
                { codigo_interno: { contains: query, mode: "insensitive" } }
            ]
        };
    }

    const [viagensRaw] = await Promise.all([
        prisma.viagem.findMany({
            where,
            include: { veiculo: true, motorista1: true, passageiros: true },
            orderBy: { data_partida: "desc" }
        }),
    ]);

    // JSON roundtrip to serialize Decimal (valor_pacote) and all Date fields
    const viagens: any[] = JSON.parse(JSON.stringify(viagensRaw));

    function fmtDate(d: string | null | undefined) {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("pt-BR");
    }

    const statusStyle = (s: string) => {
        if (s === "CANCELADA") return { bg: "#fef2f2", color: "#dc2626" };
        if (s === "CONCLUIDA") return { bg: "#f0fdf4", color: "#16a34a" };
        return { bg: "#eff6ff", color: "#2563eb" };
    };

    return (
        <div>
            {/* Page Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Map size={24} /> Gerenciamento de Viagens
                    </h1>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
                        {viagens.length} viagem(ns) cadastrada(s)
                    </p>
                </div>
                <Link href="/viagens/novo" style={{
                    padding: "8px 18px", backgroundColor: "#111827", color: "#fff",
                    borderRadius: "8px", fontSize: "13px", fontWeight: "700",
                    textDecoration: "none", fontFamily: "sans-serif"
                }}>
                    + Nova Viagem
                </Link>
            </div>

            {/* Filtros de Busca */}
            <FiltrosViagem />

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: "sans-serif" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                            {["Código / Nome", "Veículo", "Motorista", "Partida", "Retorno", "Pax", "Status", "Ações"].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {viagens.map((v: any) => {
                            const st = statusStyle(v.status);
                            return (
                                <tr key={v.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <td style={{ padding: "14px 16px" }}>
                                        {v.codigo_interno && (
                                            <div style={{ fontSize: "11px", fontFamily: "monospace", color: "#9ca3af", marginBottom: "2px" }}>{v.codigo_interno}</div>
                                        )}
                                        <div style={{ fontWeight: "700", color: "#be185d" }}>{v.nome_viagem}</div>
                                        {v.tipo_viagem && <div style={{ fontSize: "11px", color: "#6b7280" }}>{v.tipo_viagem}</div>}
                                    </td>
                                    <td style={{ padding: "14px 16px", color: "#374151" }}>
                                        {v.veiculo?.prefixo || <span style={{ color: "#d1d5db" }}>Não definido</span>}
                                    </td>
                                    <td style={{ padding: "14px 16px", color: "#374151" }}>
                                        {v.motorista1?.nome_completo?.split(" ")[0] || <span style={{ color: "#d1d5db" }}>—</span>}
                                    </td>
                                    <td style={{ padding: "14px 16px", color: "#374151", whiteSpace: "nowrap" }}>{fmtDate(v.data_partida)}</td>
                                    <td style={{ padding: "14px 16px", color: "#374151", whiteSpace: "nowrap" }}>{fmtDate(v.data_retorno)}</td>
                                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                                        <span style={{ fontWeight: "700", color: "#374151" }}>{v.passageiros?.length ?? 0}</span>
                                        {v.qtd_passageiros && <span style={{ color: "#9ca3af" }}>/{v.qtd_passageiros}</span>}
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", backgroundColor: st.bg, color: st.color }}>
                                            {v.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                                            <Link href={`/viagens/${v.id}/imprimir`} target="_blank" style={{ padding: "4px 10px", backgroundColor: "#ecfeff", color: "#0891b2", border: "1px solid #a5f3fc", borderRadius: "6px", fontSize: "11px", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}><Printer size={14} /> Imprimir</Link>
                                            <Link href={`/viagens/${v.id}/roteiro`} target="_blank" style={{ padding: "4px 10px", backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: "6px", fontSize: "11px", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}><Map size={14} /> Roteiro</Link>
                                            <Link href={`/viagens/${v.id}`} style={{ padding: "4px 10px", backgroundColor: "#f3e8ff", color: "#7c3aed", border: "1px solid #d8b4fe", borderRadius: "6px", fontSize: "11px", fontWeight: "700", textDecoration: "none", display: "flex", alignItems: "center", gap: "4px" }}><Edit2 size={14} /> Editar</Link>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {viagens.length === 0 && (
                    <div style={{ padding: "48px", textAlign: "center", color: "#9ca3af", fontFamily: "sans-serif" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                            <Map size={40} color="#9ca3af" />
                        </div>
                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>Nenhuma viagem cadastrada ainda</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Clique em "+ Nova Viagem" para criar a primeira.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

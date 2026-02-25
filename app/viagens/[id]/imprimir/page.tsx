import prisma from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "../../../../components/PrintButton";
import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export default async function ImprimirViagemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await getSession();
    if (!session) redirect("/login");

    const viagemRaw = await prisma.viagem.findUnique({
        where: { id, empresaId: session.empresaId as string },
        include: {
            empresa: true,
            veiculo: true,
            motorista1: true,
            motorista2: true,
            roteiros: { orderBy: { data: "asc" } },
            passageiros: true,
        }
    });

    if (!viagemRaw) return notFound();

    const viagem: any = JSON.parse(JSON.stringify(viagemRaw));

    const passageiros = [...viagem.passageiros].sort((a: any, b: any) =>
        parseInt(a.poltrona || "0") - parseInt(b.poltrona || "0")
    );

    function fmtDate(d: string) {
        return new Date(d).toLocaleDateString("pt-BR", { timeZone: "UTC" });
    }

    const empresa = viagem.empresa;

    return (
        <div style={{ fontFamily: "'Arial', sans-serif", color: "#111" }}>
            <style>{`
                @media print {
                    @page { size: A4; margin: 18mm 16mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .print-break { break-before: page; }
                }
            `}</style>

            <div style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 40px", background: "#fff", minHeight: "100vh" }}>

                {/* ── Header ── */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "20px", borderBottom: "3px solid #111", marginBottom: "28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        {empresa.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={empresa.logo_url} alt="Logo" style={{ height: "48px", objectFit: "contain" }} />
                        )}
                        <div>
                            <h1 style={{ margin: "0 0 2px", fontSize: "28px", fontWeight: "900", letterSpacing: "-0.03em", textTransform: "uppercase" }}>
                                {empresa.nome_fantasia}
                            </h1>
                            {empresa.razao_social && (
                                <p style={{ margin: 0, fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                    {empresa.razao_social}
                                </p>
                            )}
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800", textTransform: "uppercase" }}>
                            {viagem.codigo_interno ? `${viagem.codigo_interno} — ` : ""}{viagem.nome_viagem}
                        </h2>
                        <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                            {fmtDate(viagem.data_partida)} a {fmtDate(viagem.data_retorno)}
                        </p>
                    </div>
                </div>

                {/* ── Operational info ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", padding: "16px", background: "#f8f8f8", border: "1px solid #d1d5db", borderRadius: "8px", marginBottom: "28px" }}>
                    <div>
                        <p style={{ margin: "0 0 3px", fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Veículo</p>
                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "800" }}>{viagem.veiculo?.prefixo || "—"}</p>
                    </div>
                    <div>
                        <p style={{ margin: "0 0 3px", fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Motorista 1</p>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>{viagem.motorista1?.nome_completo || "—"}</p>
                    </div>
                    <div>
                        <p style={{ margin: "0 0 3px", fontSize: "10px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Motorista 2</p>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "700" }}>{viagem.motorista2?.nome_completo || "—"}</p>
                    </div>
                </div>

                {/* ── Itinerary ── */}
                {viagem.roteiros.length > 0 && (
                    <div style={{ marginBottom: "32px" }}>
                        <h3 style={{ margin: "0 0 10px", fontSize: "14px", fontWeight: "800", textTransform: "uppercase", borderBottom: "1px solid #d1d5db", paddingBottom: "6px" }}>Roteiro</h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                            <tbody>
                                {viagem.roteiros.map((r: any, idx: number) => (
                                    <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "6px 10px 6px 0", width: "110px", fontWeight: "700", verticalAlign: "top", whiteSpace: "nowrap", color: "#374151" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "20px", height: "20px", borderRadius: "50%", background: "#111", color: "#fff", fontSize: "10px", fontWeight: "800", marginRight: "6px" }}>{idx + 1}</span>
                                            {fmtDate(r.data)}
                                        </td>
                                        <td style={{ padding: "6px 0", color: "#374151", lineHeight: "1.5" }}>{r.descricao}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── Passenger list ── */}
                <div className="print-break">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #111", paddingBottom: "6px", marginBottom: "12px" }}>
                        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "800", textTransform: "uppercase" }}>Lista de Passageiros</h3>
                        <span style={{ fontSize: "12px", fontWeight: "700", background: "#f3f4f6", padding: "3px 12px", borderRadius: "20px", border: "1px solid #d1d5db" }}>
                            Total: {passageiros.length}
                        </span>
                    </div>

                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                            <tr style={{ borderBottom: "2px solid #111" }}>
                                <th style={{ padding: "8px 6px", textAlign: "center", width: "56px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Poltrona</th>
                                <th style={{ padding: "8px 6px", textAlign: "left", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>Nome do Passageiro</th>
                                <th style={{ padding: "8px 6px", textAlign: "left", width: "130px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>RG</th>
                                <th style={{ padding: "8px 6px", textAlign: "left", width: "130px", fontSize: "10px", fontWeight: "700", textTransform: "uppercase" }}>CPF</th>
                            </tr>
                        </thead>
                        <tbody>
                            {passageiros.length > 0 ? (
                                passageiros.map((p: any, idx: number) => (
                                    <tr key={p.id} style={{ borderBottom: "1px solid #e5e7eb", background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                                        <td style={{ padding: "8px 6px", textAlign: "center", fontWeight: "900", fontSize: "15px" }}>{p.poltrona}</td>
                                        <td style={{ padding: "8px 6px", fontWeight: "700", textTransform: "uppercase" }}>{p.nome}</td>
                                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontSize: "11px", color: "#374151" }}>{p.rg || "—"}</td>
                                        <td style={{ padding: "8px 6px", fontFamily: "monospace", fontSize: "11px", color: "#374151" }}>{p.cpf || "—"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "#9ca3af", fontStyle: "italic" }}>
                                        Nenhum passageiro alocado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Footer ── */}
                <div style={{ marginTop: "40px", paddingTop: "12px", borderTop: "1px solid #d1d5db", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af" }}>
                    <span>Documento gerado por ViagiOn em {new Date().toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
                    <span>{empresa.nome_fantasia}</span>
                </div>
            </div>

            <PrintButton />
        </div>
    );
}

import prisma from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import PrintButton from "../../../../components/PrintButton";
import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";

export default async function RoteiroViagemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await getSession();
    if (!session) redirect("/login");

    const viagemRaw = await prisma.viagem.findUnique({
        where: { id, empresaId: session.empresaId as string },
        include: {
            empresa: true,
            roteiros: { orderBy: { data: "asc" } },
        }
    });

    if (!viagemRaw) return notFound();

    const viagem: any = JSON.parse(JSON.stringify(viagemRaw));

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
                        <p style={{ margin: "0 0 2px", fontSize: "10px", fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em" }}>Roteiro de Viagem</p>
                        <h2 style={{ margin: "0 0 4px", fontSize: "18px", fontWeight: "800", textTransform: "uppercase" }}>
                            {viagem.codigo_interno ? `${viagem.codigo_interno} — ` : ""}{viagem.nome_viagem}
                        </h2>
                        <p style={{ margin: 0, fontSize: "13px", color: "#374151" }}>
                            {fmtDate(viagem.data_partida)} a {fmtDate(viagem.data_retorno)}
                        </p>
                    </div>
                </div>

                {/* ── Itinerary ── */}
                {viagem.roteiros.length > 0 ? (
                    <div style={{ marginBottom: "32px" }}>
                        <h3 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: "800", textTransform: "uppercase", borderBottom: "1px solid #d1d5db", paddingBottom: "6px" }}>
                            Programação
                        </h3>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                            <tbody>
                                {viagem.roteiros.map((r: any, idx: number) => (
                                    <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                        <td style={{ padding: "10px 12px 10px 0", width: "120px", fontWeight: "700", verticalAlign: "top", whiteSpace: "nowrap", color: "#374151" }}>
                                            <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "22px", height: "22px", borderRadius: "50%", background: "#111", color: "#fff", fontSize: "10px", fontWeight: "800", marginRight: "8px" }}>{idx + 1}</span>
                                            {fmtDate(r.data)}
                                        </td>
                                        <td style={{ padding: "10px 0", color: "#111", lineHeight: "1.6" }}>{r.descricao}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={{ textAlign: "center", padding: "40px", color: "#9ca3af", border: "2px dashed #e5e7eb", borderRadius: "12px", marginBottom: "32px" }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600" }}>Nenhum roteiro cadastrado para esta viagem.</p>
                    </div>
                )}

                {/* ── Observations box (empty — for handwriting) ── */}
                <div style={{ border: "1px solid #d1d5db", borderRadius: "8px", padding: "16px", marginBottom: "32px" }}>
                    <p style={{ margin: "0 0 32px", fontSize: "11px", fontWeight: "800", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>Observações</p>
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

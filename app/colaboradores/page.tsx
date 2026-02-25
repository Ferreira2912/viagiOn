import prisma from "../../lib/prisma";
import ModalColaborador from "../../components/ModalColaborador";
import { getSession } from "../../lib/auth";
import { redirect } from "next/navigation";
import { Users, User, AlertTriangle } from "lucide-react";

export default async function ColaboradoresPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const raw = await prisma.motorista.findMany({
        where: { empresaId: session.empresaId as string },
        orderBy: { nome_completo: "asc" }
    });

    // JSON roundtrip: serializa Decimal (salario) e Date para tipos planos
    const colaboradores: any[] = JSON.parse(JSON.stringify(raw));

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
                        <Users size={24} /> Gestão de Colaboradores
                    </h1>
                    <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>{colaboradores.length} colaborador(es) cadastrado(s)</p>
                </div>
                <ModalColaborador />
            </div>

            {/* Table */}
            <div style={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", fontFamily: "sans-serif" }}>
                    <thead>
                        <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                            {["Nome", "Função", "CPF", "CNH", "Admissão", "Vcto CNH", "Status", ""].map(h => (
                                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {colaboradores.map((c) => {
                            const cnhVenc = c.validade_cnh ? new Date(c.validade_cnh).getTime() - Date.now() : null;
                            const cnhExpirando = cnhVenc !== null && cnhVenc < 60 * 24 * 60 * 60 * 1000;
                            const desligado = c.status_colaborador === "DESLIGADO";

                            return (
                                <tr key={c.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                                    <td style={{ padding: "14px 16px", fontWeight: "700", color: "#111827" }}>{c.nome_completo}</td>
                                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>{c.funcao || "—"}</td>
                                    <td style={{ padding: "14px 16px", color: "#6b7280", fontFamily: "monospace", fontSize: "12px" }}>{c.cpf || "—"}</td>
                                    <td style={{ padding: "14px 16px", color: "#6b7280", fontFamily: "monospace", fontSize: "12px" }}>{c.cnh || "—"}</td>
                                    <td style={{ padding: "14px 16px", color: "#6b7280" }}>{fmtDate(c.data_admissao)}</td>
                                    <td style={{ padding: "14px 16px", color: cnhExpirando ? "#dc2626" : "#6b7280", fontWeight: cnhExpirando ? "700" : "400" }}>
                                        {fmtDate(c.validade_cnh)}
                                        {cnhExpirando && <span style={{ marginLeft: "6px", fontSize: "11px", backgroundColor: "#fef2f2", color: "#dc2626", padding: "2px 6px", borderRadius: "4px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "2px" }}><AlertTriangle size={12} /> VENCE</span>}
                                    </td>
                                    <td style={{ padding: "14px 16px" }}>
                                        <span style={{
                                            padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "700",
                                            backgroundColor: c.status_colaborador === "DESLIGADO" ? "#fef2f2" : c.status_colaborador === "AFASTADO" ? "#fffbeb" : "#f0fdf4",
                                            color: c.status_colaborador === "DESLIGADO" ? "#dc2626" : c.status_colaborador === "AFASTADO" ? "#d97706" : "#16a34a"
                                        }}>
                                            {c.status_colaborador || "CONTRATADO"}
                                        </span>
                                    </td>
                                    <td style={{ padding: "14px 16px", textAlign: "right" }}>
                                        <ModalColaborador colaborador={c} isEdit={true} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {colaboradores.length === 0 && (
                    <div style={{ padding: "48px", textAlign: "center", color: "#9ca3af", fontFamily: "sans-serif" }}>
                        <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                            <User size={40} color="#9ca3af" />
                        </div>
                        <p style={{ margin: 0, fontSize: "15px", fontWeight: "600" }}>Nenhum colaborador cadastrado</p>
                        <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>Clique em "+ Novo Colaborador" para começar.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

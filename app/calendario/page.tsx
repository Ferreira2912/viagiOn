import CalendarioGrid from "../../components/CalendarioGrid";
import prisma from "../../lib/prisma";
import { getSession } from "../../lib/auth";
import { redirect } from "next/navigation";
import { Calendar } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const [veiculosRaw, viagensRaw] = await Promise.all([
        prisma.veiculo.findMany({
            where: { empresaId: session.empresaId as string },
            orderBy: { prefixo: "asc" }
        }),
        prisma.viagem.findMany({
            where: { empresaId: session.empresaId as string, status: { not: "CANCELADA" } },
            include: { veiculo: true, motorista1: true, motorista2: true },
            orderBy: { data_partida: "asc" }
        })
    ]);

    const veiculos: any[] = JSON.parse(JSON.stringify(veiculosRaw));
    const viagens: any[] = JSON.parse(JSON.stringify(viagensRaw));

    const agora = new Date();

    return (
        <div>
            <div style={{ paddingBottom: "16px", borderBottom: "1px solid #e5e7eb", marginBottom: "24px" }}>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={24} /> Calendário da Frota
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
                    {viagens.filter(v => v.status === "ATIVA").length} viagem(ns) ativa(s)
                </p>
            </div>

            <CalendarioGrid
                veiculos={veiculos}
                viagens={viagens}
                anoInicial={agora.getFullYear()}
                mesInicial={agora.getMonth()}
            />
        </div>
    );
}

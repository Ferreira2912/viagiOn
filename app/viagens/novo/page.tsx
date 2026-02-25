import prisma from "../../../lib/prisma";
import WizardViagem from "../../../components/WizardViagem";
import { getSession } from "../../../lib/auth";
import { redirect } from "next/navigation";
import { Map } from "lucide-react";

export default async function NovaViagemPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const [veiculosRaw, motoristasRaw] = await Promise.all([
        prisma.veiculo.findMany({
            where: { empresaId: session.empresaId as string },
            orderBy: { prefixo: "asc" }
        }),
        prisma.motorista.findMany({
            where: { empresaId: session.empresaId as string, status_operacional: "ATIVO" },
            orderBy: { nome_completo: "asc" }
        })
    ]);

    const veiculos: any[] = JSON.parse(JSON.stringify(veiculosRaw));
    const motoristas: any[] = JSON.parse(JSON.stringify(motoristasRaw));

    return (
        <div>
            <div style={{ marginBottom: "24px" }}>
                <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "#111827", fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Map size={24} /> Nova Viagem
                </h1>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#6b7280", fontFamily: "sans-serif" }}>
                    Preencha os dados passo a passo para cadastrar a nova viagem.
                </p>
            </div>
            <WizardViagem veiculos={veiculos} motoristas={motoristas} />
        </div>
    );
}

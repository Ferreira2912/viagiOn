import prisma from "../../../../lib/prisma";
import WizardViagem from "../../../../components/WizardViagem";
import { notFound } from "next/navigation";
import { getSession } from "../../../../lib/auth";
import { redirect } from "next/navigation";
import { Edit2 } from "lucide-react";

export default async function EditarViagemPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    const session = await getSession();
    if (!session) redirect("/login");

    const [viagemRaw, veiculosRaw, motoristasRaw] = await Promise.all([
        prisma.viagem.findUnique({ where: { id, empresaId: session.empresaId as string } }),
        prisma.veiculo.findMany({ where: { empresaId: session.empresaId as string }, orderBy: { prefixo: "asc" } }),
        prisma.motorista.findMany({ where: { empresaId: session.empresaId as string, status_operacional: "ATIVO" }, orderBy: { nome_completo: "asc" } })
    ]);

    if (!viagemRaw) return notFound();

    const viagem: any = JSON.parse(JSON.stringify(viagemRaw));
    const veiculos: any[] = JSON.parse(JSON.stringify(veiculosRaw));
    const motoristas: any[] = JSON.parse(JSON.stringify(motoristasRaw));

    return (
        <div>
            <div style={{ marginBottom: "24px", fontFamily: "sans-serif" }}>
                <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Edit2 size={24} /> Editar Viagem
                </h1>
                <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>Altere os dados básicos, roteiro e custos da viagem.</p>
            </div>
            <WizardViagem veiculos={veiculos} motoristas={motoristas} viagem={viagem} />
        </div>
    );
}

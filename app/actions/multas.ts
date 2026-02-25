"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "../../lib/auth";

export async function salvarMulta(formData: FormData) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };

    const id = formData.get("id") as string;

    const data: any = {
        veiculoId: formData.get("veiculoId") as string,
        motoristaId: formData.get("motoristaId") as string,
        data_infracao: new Date(formData.get("data_infracao") as string),
        descricao: formData.get("descricao") as string,
        valor: parseFloat((formData.get("valor") as string || "0").replace(/\./g, "").replace(",", ".")),
        pontos_cnh: parseInt(formData.get("pontos_cnh") as string) || 0,
        pago_descontado: formData.getAll("pago_descontado").includes("true") || formData.getAll("pago_descontado").includes("on"),
    };

    try {
        if (id) {
            await prisma.multa.update({ where: { id, empresaId: session.empresaId as string }, data });
        } else {
            await prisma.multa.create({ data: { ...data, empresaId: session.empresaId as string } });
        }
    } catch (e: any) {
        return { erro: "Erro ao salvar multa: " + e.message };
    }

    revalidatePath("/multas");
    return { sucesso: true };
}

export async function deletarMulta(id: string) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };
    try {
        await prisma.multa.delete({ where: { id, empresaId: session.empresaId as string } });
    } catch (e: any) {
        return { erro: "Erro ao excluir multa." };
    }
    revalidatePath("/multas");
    return { sucesso: true };
}

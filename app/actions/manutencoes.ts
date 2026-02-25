"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "../../lib/auth";

export async function salvarManutencao(formData: FormData) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };

    const id = formData.get("id") as string;

    const data: any = {
        veiculoId: formData.get("veiculoId") as string,
        fornecedor: formData.get("fornecedor") as string,
        tipo_manutencao: formData.get("tipo_manutencao") as string,
        quilometragem: formData.get("quilometragem") ? parseInt(formData.get("quilometragem") as string) : null,
        data_manutencao: new Date(formData.get("data_manutencao") as string),
        agendar_proxima: formData.getAll("agendar_proxima").includes("true") || formData.getAll("agendar_proxima").includes("on"),
        descricao: formData.get("descricao") as string || null,
        pago: formData.getAll("pago").includes("true") || formData.getAll("pago").includes("on"),
    };

    try {
        if (id) {
            await prisma.manutencao.update({ where: { id, empresaId: session.empresaId as string }, data });
        } else {
            await prisma.manutencao.create({ data: { ...data, empresaId: session.empresaId as string } });
        }
    } catch (e: any) {
        return { erro: "Erro ao salvar manutenção: " + e.message };
    }

    revalidatePath("/manutencoes");
    return { sucesso: true };
}

export async function deletarManutencao(id: string) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };
    try {
        await prisma.manutencao.delete({ where: { id, empresaId: session.empresaId as string } });
    } catch (e: any) {
        return { erro: "Erro ao excluir manutenção." };
    }
    revalidatePath("/manutencoes");
    return { sucesso: true };
}

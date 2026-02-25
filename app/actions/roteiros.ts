"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function buscarRoteiros(viagemId: string) {
    const roteiros = await prisma.viagemRoteiro.findMany({
        where: { viagemId },
        orderBy: { data: "asc" }
    });
    // Serialize Date for client component compatibility
    return JSON.parse(JSON.stringify(roteiros));
}

export async function adicionarRoteiro(formData: FormData) {
    const viagemId = formData.get("viagemId") as string;
    const data = new Date((formData.get("data") as string) + "T12:00:00Z");
    const descricao = formData.get("descricao") as string;

    if (!viagemId || !descricao) return { erro: "Dados incompletos." };

    try {
        await prisma.viagemRoteiro.create({ data: { viagemId, data, descricao } });
    } catch (e: any) {
        return { erro: "Erro ao adicionar roteiro: " + e.message };
    }

    revalidatePath("/viagens");
    return { sucesso: true };
}

export async function deletarRoteiro(id: string) {
    try {
        await prisma.viagemRoteiro.delete({ where: { id } });
    } catch (e: any) {
        return { erro: "Erro ao deletar." };
    }
    revalidatePath("/viagens");
    return { sucesso: true };
}

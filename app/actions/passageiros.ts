"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function adicionarPassageiro(formData: FormData) {
    const viagemId = formData.get("viagemId") as string;
    const nome = formData.get("nome") as string;
    const rg = formData.get("rg") as string || null;
    const cpf = formData.get("cpf") as string || null;
    const poltrona = formData.get("poltrona") as string;

    if (!viagemId || !nome || !poltrona) return { erro: "Dados incompletos." };

    try {
        await prisma.viagemPassageiro.create({ data: { viagemId, nome, rg, cpf, poltrona } });
    } catch (e: any) {
        return { erro: "Erro ao adicionar passageiro: " + e.message };
    }

    revalidatePath(`/viagens/${viagemId}`);
    return { sucesso: true };
}

export async function removerPassageiro(id: string, viagemId: string) {
    try {
        await prisma.viagemPassageiro.delete({ where: { id } });
    } catch (e: any) {
        return { erro: "Erro ao remover passageiro." };
    }
    revalidatePath(`/viagens/${viagemId}`);
    return { sucesso: true };
}

export async function buscarPassageiros(viagemId: string) {
    const passageiros = await prisma.viagemPassageiro.findMany({
        where: { viagemId },
        orderBy: { poltrona: "asc" }
    });
    return JSON.parse(JSON.stringify(passageiros));
}

"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function buscarFornecedores(viagemId: string) {
    const fornecedores = await prisma.viagemFornecedor.findMany({
        where: { viagemId },
        orderBy: { tipo_custo: "asc" }
    });
    // JSON roundtrip converts Decimal (valor) and Date fields
    return JSON.parse(JSON.stringify(fornecedores));
}

export async function adicionarFornecedor(formData: FormData) {
    const viagemId = formData.get("viagemId") as string;
    const fornecedor = formData.get("fornecedor") as string;
    const tipo_custo = formData.get("tipo_custo") as string;
    const valor = parseFloat((formData.get("valor") as string || "0").replace(/\./g, "").replace(",", "."));
    const dataStr = formData.get("data_pgto") as string;
    const data_pgto = dataStr ? new Date(dataStr) : null;

    if (!viagemId || !fornecedor || !tipo_custo) return { erro: "Dados incompletos." };

    try {
        await prisma.viagemFornecedor.create({
            data: { viagemId, fornecedor, tipo_custo, valor, data_pgto }
        });
    } catch (e: any) {
        return { erro: "Erro ao adicionar fornecedor: " + e.message };
    }

    revalidatePath("/viagens");
    return { sucesso: true };
}

export async function deletarFornecedor(id: string) {
    try {
        await prisma.viagemFornecedor.delete({ where: { id } });
    } catch (e: any) {
        return { erro: "Erro ao excluir fornecedor." };
    }
    revalidatePath("/viagens");
    return { sucesso: true };
}

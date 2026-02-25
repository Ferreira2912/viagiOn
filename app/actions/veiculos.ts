"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "../../lib/auth";

export async function salvarVeiculo(formData: FormData) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };

    const id = formData.get("id") as string;

    const data: any = {
        prefixo: formData.get("prefixo") as string,
        placa: formData.get("placa") as string,
        chassi: formData.get("chassi") as string || null,
        renavam: formData.get("renavam") as string || null,
        marca_carroceria: formData.get("marca_carroceria") as string || null,
        modelo_carroceria: formData.get("modelo_carroceria") as string || null,
        marca_chassi: formData.get("marca_chassi") as string || null,
        ano_fabricacao: formData.get("ano_fabricacao") ? parseInt(formData.get("ano_fabricacao") as string) : null,
        ano_modelo: formData.get("ano_modelo") ? parseInt(formData.get("ano_modelo") as string) : null,
        lugares: formData.get("lugares") ? parseInt(formData.get("lugares") as string) : null,
        tipo_veiculo: formData.get("tipo_veiculo") as string || null,
        cor_veiculo: formData.get("cor_veiculo") as string || null,
        status: formData.get("status") as string || "ATIVO",
        custo_km: formData.get("custo_km") ? parseFloat((formData.get("custo_km") as string).replace(/\./g, "").replace(",", ".")) : null,
        croqui_config: formData.get("croqui_config") ? JSON.parse(formData.get("croqui_config") as string) : undefined,
    };

    try {
        if (id) {
            await prisma.veiculo.update({ where: { id, empresaId: session.empresaId as string }, data });
        } else {
            await prisma.veiculo.create({ data: { ...data, empresaId: session.empresaId as string } });
        }
    } catch (e: any) {
        if (e?.code === "P2002") return { erro: "Esta placa já está cadastrada." };
        return { erro: "Erro ao salvar veículo: " + e.message };
    }

    revalidatePath("/veiculos");
    return { sucesso: true };
}

export async function deletarVeiculo(id: string) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };
    try {
        await prisma.veiculo.delete({ where: { id, empresaId: session.empresaId as string } });
    } catch {
        return { erro: "Não é possível excluir um veículo com registos associados." };
    }
    revalidatePath("/veiculos");
    return { sucesso: true };
}

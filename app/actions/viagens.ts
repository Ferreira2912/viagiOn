"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "../../lib/auth";

export async function salvarViagemPasso1(formData: FormData) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };

    const id = formData.get("id") as string;

    const data: any = {
        codigo_interno: formData.get("codigo_interno") as string || null,
        nome_viagem: formData.get("nome_viagem") as string,
        tipo_viagem: formData.get("tipo_viagem") as string || null,
        observacoes: formData.get("observacoes") as string || null,
        pacote_inclui: formData.get("pacote_inclui") as string || null,
        data_partida: new Date(formData.get("data_partida") as string),
        data_inicio_retorno: formData.get("data_inicio_retorno") ? new Date(formData.get("data_inicio_retorno") as string) : null,
        data_retorno: new Date(formData.get("data_retorno") as string),
        qtd_dias: parseInt(formData.get("qtd_dias") as string) || null,
        qtd_noites: parseInt(formData.get("qtd_noites") as string) || null,
        motorista1Id: formData.get("motorista1Id") as string || null,
        motorista2Id: formData.get("motorista2Id") as string || null,
        veiculoId: formData.get("veiculoId") as string || null,
        distancia_km: parseInt(formData.get("distancia_km") as string) || null,
        valor_pacote: formData.get("valor_pacote") ? parseFloat((formData.get("valor_pacote") as string).replace(/\./g, "").replace(",", ".")) : null,
        qtd_passageiros: parseInt(formData.get("qtd_passageiros") as string) || null,
    };

    try {
        let viagemId = id;
        if (id) {
            await prisma.viagem.update({ where: { id, empresaId: session.empresaId as string }, data });
        } else {
            const nova = await prisma.viagem.create({ data: { ...data, empresaId: session.empresaId as string } });
            viagemId = nova.id;
        }
        revalidatePath("/viagens");
        return { sucesso: true, viagemId };
    } catch (e: any) {
        return { erro: "Erro ao salvar viagem: " + e.message };
    }
}

export async function atualizarStatusViagem(id: string, status: string) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };
    await prisma.viagem.update({ where: { id, empresaId: session.empresaId as string }, data: { status } });
    revalidatePath("/viagens");
    return { sucesso: true };
}

export async function buscarResumoViagem(id: string) {
    const session = await getSession();
    if (!session) return null;
    const viagem = await prisma.viagem.findUnique({
        where: { id, empresaId: session.empresaId as string },
        include: {
            veiculo: true,
            motorista1: true,
            motorista2: true,
            roteiros: { orderBy: { data: "asc" } },
            fornecedores: { orderBy: { tipo_custo: "asc" } }
        }
    });
    if (!viagem) return null;
    return JSON.parse(JSON.stringify(viagem));
}

"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

export async function criarEventoFrota(formData: FormData) {
    const veiculoId = formData.get("veiculoId") as string;
    const motoristaId = formData.get("motoristaId") as string;
    const titulo = formData.get("titulo") as string;
    const inicio = new Date(formData.get("inicio") as string);
    const fim = new Date(formData.get("fim") as string);
    const tipo = formData.get("tipo") as string || "VIAGEM_TURISMO";

    if (!motoristaId) return { erro: "É necessário selecionar um motorista." };

    // Trava Anti-Choque (Overbooking Validation)
    const conflito = await prisma.eventoFrota.findFirst({
        where: {
            veiculoId: veiculoId,
            status: { not: "CANCELADO" },
            AND: [
                { data_hora_inicio: { lt: fim } },
                { data_hora_fim: { gt: inicio } }
            ]
        }
    });

    if (conflito) return { erro: "O veículo já possui um agendamento neste período!" };

    await prisma.eventoFrota.create({
        data: {
            veiculoId,
            motoristaId,
            titulo: titulo,
            tipo_evento: tipo as any,
            status: "AGENDADO",
            data_hora_inicio: inicio,
            data_hora_fim: fim,
        }
    });

    revalidatePath("/");
    return { sucesso: true };
}

export async function deletarEventoFrota(id: string) {
    try {
        await prisma.eventoFrota.delete({ where: { id } });
        revalidatePath("/");
        return { sucesso: true };
    } catch (error) {
        return { erro: "Falha ao deletar a viagem." };
    }
}

export async function editarEventoFrota(formData: FormData) {
    const id = formData.get("id") as string;
    const veiculoId = formData.get("veiculoId") as string;
    const motoristaId = formData.get("motoristaId") as string;
    const titulo = formData.get("titulo") as string;
    const inicio = new Date(formData.get("inicio") as string);
    const fim = new Date(formData.get("fim") as string);

    // Trava Anti-Choque (ignora a própria viagem na checagem)
    const conflito = await prisma.eventoFrota.findFirst({
        where: {
            veiculoId: veiculoId,
            id: { not: id },
            status: { not: "CANCELADO" },
            AND: [
                { data_hora_inicio: { lt: fim } },
                { data_hora_fim: { gt: inicio } }
            ]
        }
    });

    if (conflito) return { erro: "O veículo selecionado já possui um agendamento neste período!" };

    await prisma.eventoFrota.update({
        where: { id },
        data: {
            veiculoId,
            motoristaId,
            titulo: titulo,
            data_hora_inicio: inicio,
            data_hora_fim: fim,
        }
    });

    revalidatePath("/");
    return { sucesso: true };
}

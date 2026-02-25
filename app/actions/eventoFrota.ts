"use server";

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type CreateEventoFrotaInput = {
  titulo: string;
  tipo_evento: "VIAGEM_TURISMO" | "FRETAMENTO" | "MANUTENCAO";
  data_hora_inicio: Date;
  data_hora_fim: Date;
  veiculoId: string;
  motoristaId: string;
};

export async function createEventoFrota(data: CreateEventoFrotaInput) {
  try {
    const {
      titulo,
      tipo_evento,
      data_hora_inicio,
      data_hora_fim,
      veiculoId,
      motoristaId,
    } = data;

    // Garante que as datas são objetos Date válidos
    const inicio = new Date(data_hora_inicio);
    const fim = new Date(data_hora_fim);

    if (inicio >= fim) {
      return { success: false, error: "A data de início deve ser anterior à data de fim." };
    }

    // --- Trava Anti-Choque (Anti-overlap lock) ---
    // Verifica se existe algum evento para o mesmo veículo onde:
    // O evento existente começa ANTES do novo evento terminar
    // E o evento existente termina DEPOIS do novo evento começar
    const choqueVeiculo = await prisma.eventoFrota.findFirst({
      where: {
        veiculoId: veiculoId,
        status: { not: "CANCELADO" },
        AND: [
          { data_hora_inicio: { lt: fim } },
          { data_hora_fim: { gt: inicio } }
        ]
      }
    });

    if (choqueVeiculo) {
      return {
        success: false,
        error: "Choque de datas: O veículo já possui um evento agendado neste período."
      };
    }

    // Opcional: Trava anti-choque para o motorista, garantindo que ele não esteja em dois eventos ao mesmo tempo
    const choqueMotorista = await prisma.eventoFrota.findFirst({
      where: {
        motoristaId: motoristaId,
        status: { not: "CANCELADO" },
        AND: [
          { data_hora_inicio: { lt: fim } },
          { data_hora_fim: { gt: inicio } }
        ]
      }
    });

    if (choqueMotorista) {
      return {
        success: false,
        error: "Choque de datas: O motorista já está escalado para outro evento neste período."
      };
    }

    // Caso não haja choque, cria o evento
    const novoEvento = await prisma.eventoFrota.create({
      data: {
        titulo,
        tipo_evento,
        data_hora_inicio: inicio,
        data_hora_fim: fim,
        veiculoId,
        motoristaId,
        status: "AGENDADO",
      }
    });

    return { success: true, data: novoEvento };

  } catch (error: any) {
    console.error("Erro ao agendar Evento da Frota:", error);
    return { success: false, error: "Ocorreu um erro interno ao tentar agendar o evento." };
  }
}

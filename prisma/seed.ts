import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is missing");

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log("Iniciando seed...");

    // Limpar tabelas (ordem importa devido às chaves estrangeiras)
    await prisma.eventoFrota.deleteMany();
    await prisma.viagemRoteiro.deleteMany();
    await prisma.viagemPassageiro.deleteMany();
    await prisma.viagemFornecedor.deleteMany();
    await prisma.viagem.deleteMany();
    await prisma.arquivoVeiculo.deleteMany();
    await prisma.multa.deleteMany();
    await prisma.manutencao.deleteMany();
    await prisma.veiculo.deleteMany();
    await prisma.motorista.deleteMany();
    await prisma.usuario.deleteMany();
    await prisma.empresa.deleteMany();

    // Criar Empresa
    const empresa = await prisma.empresa.create({
        data: {
            nome_fantasia: "ViagiOn",
            cnpj: "00000000000000",
        },
    });

    // Criar Motoristas
    const carlos = await prisma.motorista.create({
        data: {
            empresaId: empresa.id,
            nome_completo: "Carlos Silva",
            cpf: "11111111111",
            cnh: "123456789",
            validade_cnh: new Date("2027-12-01"),
            status_operacional: "ATIVO",
        },
    });

    const roberto = await prisma.motorista.create({
        data: {
            empresaId: empresa.id,
            nome_completo: "Roberto Gomes",
            cpf: "22222222222",
            cnh: "987654321",
            validade_cnh: new Date("2026-10-15"),
            status_operacional: "ATIVO",
        },
    });

    // Criar Veículos
    const carro2050 = await prisma.veiculo.create({
        data: {
            empresaId: empresa.id,
            prefixo: "Carro 2050 - Missão Apolo",
            placa: "APO-2026",
            lugares: 44,
            status: "ATIVO",
        },
    });

    const carro1020 = await prisma.veiculo.create({
        data: {
            empresaId: empresa.id,
            prefixo: "Carro 1020 - Leito",
            placa: "PAR-1020",
            lugares: 40,
            status: "ATIVO",
        },
    });

    // Obter mês atual e ano atual
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0 a 11

    // Criar Evento 1: Viagem para Balneário Camboriú (Carro 2050)
    await prisma.eventoFrota.create({
        data: {
            titulo_evento: "Viagem Balneário Camboriú",
            tipo_evento: "VIAGEM_TURISMO",
            data_hora_inicio: new Date(year, month, 10, 8, 0, 0),
            data_hora_fim: new Date(year, month, 15, 20, 0, 0),
            veiculoId: carro2050.id,
            motoristaId: carlos.id,
        },
    });

    // Criar Evento 2: Manutenção preventiva (Carro 1020)
    await prisma.eventoFrota.create({
        data: {
            titulo_evento: "Manutenção Preventiva",
            tipo_evento: "MANUTENCAO",
            data_hora_inicio: new Date(year, month, 18, 8, 0, 0),
            data_hora_fim: new Date(year, month, 19, 18, 0, 0),
            veiculoId: carro1020.id,
            motoristaId: roberto.id,
        },
    });

    console.log("Seed concluído com sucesso!");
}

main()
    .catch((e) => {
        console.error("Erro durante o seed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

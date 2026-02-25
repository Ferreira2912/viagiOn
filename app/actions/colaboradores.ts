"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "../../lib/auth";

export async function salvarColaborador(formData: FormData) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };

    const id = formData.get("id") as string;

    const data: any = {
        nome_completo: formData.get("nome_completo") as string,
        cpf: formData.get("cpf") as string || null,
        rg: formData.get("rg") as string || null,
        cnh: formData.get("numero_cnh") as string || null,
        categoria_cnh: formData.get("categoria_cnh") as string || null,
        telefone: formData.get("telefone") as string || null,
        email: formData.get("email") as string || null,
        endereco: formData.get("endereco") as string || null,
        funcao: formData.get("funcao") as string || null,
        status_colaborador: formData.get("status_colaborador") as string || "CONTRATADO",
        status_operacional: (formData.get("status_colaborador") === "CONTRATADO" || !formData.get("status_colaborador")) ? "ATIVO" : "INATIVO",
        salario: formData.get("salario") ? parseFloat((formData.get("salario") as string).replace(/\./g, "").replace(",", ".")) : null,
        validade_cnh: formData.get("vencimento_cnh") ? new Date((formData.get("vencimento_cnh") as string) + "T12:00:00Z") : null,
        data_nascimento: formData.get("data_nascimento") ? new Date((formData.get("data_nascimento") as string) + "T12:00:00Z") : null,
        data_admissao: formData.get("data_admissao") ? new Date((formData.get("data_admissao") as string) + "T12:00:00Z") : null,
    };

    try {
        if (id) {
            await prisma.motorista.update({ where: { id, empresaId: session.empresaId as string }, data });
        } else {
            await prisma.motorista.create({ data: { ...data, empresaId: session.empresaId as string } });
        }
    } catch (e: any) {
        if (e?.code === "P2002") return { erro: "CPF já cadastrado." };
        return { erro: "Erro ao salvar colaborador: " + e.message };
    }

    revalidatePath("/colaboradores");
    return { sucesso: true };
}

export async function deletarColaborador(id: string) {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado." };
    try {
        await prisma.motorista.delete({ where: { id, empresaId: session.empresaId as string } });
    } catch {
        return { erro: "Não é possível excluir um colaborador com viagens associadas." };
    }
    revalidatePath("/colaboradores");
    return { sucesso: true };
}

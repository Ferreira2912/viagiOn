"use server";
import { createClient } from "@supabase/supabase-js";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const BUCKET = "arquivos-viagion";

export async function uploadArquivoVeiculo(formData: FormData) {
    const file = formData.get("file") as File;
    const veiculoId = formData.get("veiculoId") as string;

    if (!file || !file.name || !veiculoId) return { erro: "Arquivo ou veículo inválido." };

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${veiculoId}/${Date.now()}-${safeName}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file);
    if (error) return { erro: "Erro no upload: " + error.message };

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

    try {
        await prisma.arquivoVeiculo.create({
            data: { veiculoId, nome: file.name, url: pub.publicUrl, tipo: file.type }
        });
    } catch (e: any) {
        return { erro: "Upload OK mas erro ao salvar no BD: " + e.message };
    }

    revalidatePath("/veiculos");
    return { sucesso: true };
}

export async function deletarArquivoVeiculo(id: string, url: string) {
    // Extract path after bucket name
    const path = url.split(`/${BUCKET}/`)[1];
    if (path) {
        await supabase.storage.from(BUCKET).remove([path]);
    }
    try {
        await prisma.arquivoVeiculo.delete({ where: { id } });
    } catch { }
    revalidatePath("/veiculos");
    return { sucesso: true };
}

export async function buscarArquivosVeiculo(veiculoId: string) {
    const arqs = await prisma.arquivoVeiculo.findMany({
        where: { veiculoId },
        orderBy: { criado_em: "desc" }
    });
    return JSON.parse(JSON.stringify(arqs));
}

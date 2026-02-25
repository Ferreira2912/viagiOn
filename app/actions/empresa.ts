"use server";
import prisma from "../../lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "../../lib/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function uploadLogoEmpresa(formData: FormData): Promise<{ sucesso?: boolean; url?: string; erro?: string }> {
    const session = await getSession();
    if (!session) return { erro: "Não autorizado" };

    const file = formData.get("file") as File;
    if (!file || !file.name) return { erro: "Arquivo inválido" };

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `logos/${session.empresaId}/logo_principal.${ext}`;

    const { error } = await supabase.storage
        .from("arquivos-viagion")
        .upload(path, file, { upsert: true });

    if (error) return { erro: error.message };

    const { data: publicData } = supabase.storage
        .from("arquivos-viagion")
        .getPublicUrl(path);

    // Add cache-buster so browser doesn't serve stale image
    const urlFinal = `${publicData.publicUrl}?t=${Date.now()}`;

    await prisma.empresa.update({
        where: { id: session.empresaId as string },
        data: { logo_url: urlFinal }
    });

    // Invalidate layout so Header immediately shows new logo
    revalidatePath("/", "layout");
    return { sucesso: true, url: urlFinal };
}

export async function atualizarEmpresa(formData: FormData): Promise<void> {
    const session = await getSession();
    if (!session) return;

    const nome_fantasia = formData.get("nome_fantasia") as string;
    const razao_social = formData.get("razao_social") as string || null;
    const cnpj = formData.get("cnpj") as string || null;
    const cor_primaria = formData.get("cor_primaria") as string || "#831843";

    try {
        await prisma.empresa.update({
            where: { id: session.empresaId as string },
            // logo_url is managed separately by uploadLogoEmpresa — never overwrite here
            data: { nome_fantasia, razao_social, cnpj, cor_primaria }
        });
    } catch (e: any) {
        console.error("Erro ao atualizar empresa:", e.message);
        return;
    }

    revalidatePath("/", "layout");
}

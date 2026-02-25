"use server";
import prisma from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "../../lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function setSession(usuarioId: string, empresaId: string, role: string) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const token = await encrypt({ usuarioId, empresaId, role });
    const cookieStore = await cookies();
    cookieStore.set("viagion_session", token, {
        expires,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
    });
}

export async function registrarEmpresa(formData: FormData) {
    const nome_fantasia = formData.get("nome_fantasia") as string;
    const nome_usuario = formData.get("nome_usuario") as string;
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;

    if (!nome_fantasia || !nome_usuario || !email || !senha)
        return { erro: "Preencha todos os campos." };

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) return { erro: "Este email já está em uso." };

    const hashedSenha = await bcrypt.hash(senha, 10);

    const empresa = await prisma.empresa.create({
        data: {
            nome_fantasia,
            usuarios: {
                create: { nome: nome_usuario, email, senha: hashedSenha, role: "ADMIN" }
            }
        },
        include: { usuarios: true }
    });

    const usuario = empresa.usuarios[0];
    await setSession(usuario.id, empresa.id, usuario.role);
    redirect("/");
}

export async function login(formData: FormData) {
    const email = formData.get("email") as string;
    const senha = formData.get("senha") as string;

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) return { erro: "Credenciais inválidas." };

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return { erro: "Credenciais inválidas." };

    await setSession(usuario.id, usuario.empresaId, usuario.role);
    redirect("/");
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.set("viagion_session", "", { expires: new Date(0), path: "/" });
    redirect("/login");
}

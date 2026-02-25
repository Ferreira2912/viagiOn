import "./globals.css";
import Header from "../components/Header";
import prisma from "../lib/prisma";
import { getSession } from "../lib/auth";

export const metadata = {
    title: "Viagi On - Frota",
    description: "Controle de Ocupação da Frota",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    let empresa: { nome_fantasia: string; logo_url: string | null; cor_primaria: string | null } | null = null;

    if (session?.empresaId) {
        const raw = await prisma.empresa.findUnique({
            where: { id: session.empresaId as string },
            select: { nome_fantasia: true, logo_url: true, cor_primaria: true }
        });
        if (raw) empresa = raw;
    }

    return (
        <html lang="pt-BR">
            <body style={{ margin: 0, padding: 0, backgroundColor: "#f9fafb" }}>
                <Header empresa={empresa} />
                <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 48px" }}>
                    {children}
                </main>
            </body>
        </html>
    );
}

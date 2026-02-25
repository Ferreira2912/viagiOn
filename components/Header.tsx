"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { Bus } from "lucide-react";

const navLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Calendário", href: "/calendario" },
    { name: "Viagens", href: "/viagens" },
    { name: "Carros", href: "/veiculos" },
    { name: "Colaboradores", href: "/colaboradores" },
    { name: "Manutenções", href: "/manutencoes" },
    { name: "Multas", href: "/multas" },
    { name: "", href: "/configuracoes" },
];

type EmpresaProps = { nome_fantasia: string; logo_url: string | null; cor_primaria: string | null } | null;

export default function Header({ empresa }: { empresa?: EmpresaProps }) {
    const pathname = usePathname();

    // Hide header on auth pages and print pages
    if (pathname === "/login" || pathname === "/registro" || pathname.endsWith("/imprimir") || pathname.endsWith("/roteiro")) return null;

    return (
        <header style={{ backgroundColor: "#111827", borderBottom: "1px solid #1f2937", fontFamily: "sans-serif", position: "sticky", top: 0, zIndex: 1000 }}>
            <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: "60px" }}>

                {/* Logo / Brand */}
                <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
                    {empresa?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={empresa.logo_url}
                            alt="Logo"
                            style={{ height: "36px", objectFit: "contain", borderRadius: "4px" }}
                        />
                    ) : (
                        <Bus size={22} color="#f9fafb" />
                    )}
                    <span style={{ color: "#f9fafb", fontWeight: "800", fontSize: "16px", letterSpacing: "0.03em" }}>
                        {empresa?.nome_fantasia
                            ? <>{empresa.nome_fantasia}</>
                            : <>Viagi <span style={{ color: "#3b82f6" }}>On</span></>
                        }
                    </span>
                </Link>

                {/* Nav Links */}
                <nav style={{ display: "flex", gap: "4px" }}>
                    {navLinks.map(link => {
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    padding: "6px 16px",
                                    borderRadius: "8px",
                                    fontSize: "14px",
                                    fontWeight: isActive ? "700" : "500",
                                    textDecoration: "none",
                                    color: isActive ? "#ffffff" : "#9ca3af",
                                    backgroundColor: isActive ? (empresa?.cor_primaria || "#3b82f6") : "transparent",
                                    transition: "all 0.15s",
                                }}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <form action={logout}>
                    <button type="submit" style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: "1px solid #374151", color: "#9ca3af", background: "transparent", cursor: "pointer" }}>
                        Sair
                    </button>
                </form>
            </div>
        </header>
    );
}

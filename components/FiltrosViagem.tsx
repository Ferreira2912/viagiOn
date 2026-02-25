"use client";
import React, { useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

export default function FiltrosViagem() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const formRef = useRef<HTMLFormElement>(null);

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const params = new URLSearchParams();

        const q = fd.get("q") as string;
        if (q && q.trim() !== "") params.set("q", q.trim());

        router.push(`${pathname}?${params.toString()}`);
    };

    const clear = () => {
        formRef.current?.reset();
        router.push(pathname);
    };

    const inp = { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", width: "100%", minWidth: "280px" };

    return (
        <form ref={formRef} onSubmit={onSubmit} style={{ display: "flex", gap: "12px", alignItems: "center", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e5e7eb", marginBottom: "24px" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", display: "flex", alignItems: "center", color: "#9ca3af" }}>
                    <Search size={16} />
                </span>
                <input
                    type="text"
                    name="q"
                    defaultValue={searchParams.get("q") || ""}
                    placeholder="Pesquisar viagem por código interno ou nome..."
                    style={{ ...inp, paddingLeft: "36px" }}
                />
            </div>

            <button type="submit" style={{ padding: "8px 16px", backgroundColor: "#111827", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}>
                Buscar
            </button>
            {searchParams.has("q") && (
                <button type="button" onClick={clear} style={{ padding: "8px 16px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "8px", fontSize: "14px", fontWeight: "700", cursor: "pointer", transition: "all 0.2s" }}>
                    Limpar
                </button>
            )}
        </form>
    );
}

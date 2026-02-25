"use client";
import React, { useState, useEffect } from "react";
import { login } from "../actions/auth";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [erro, setErro] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setIsLoaded(true), 1200);
        return () => clearTimeout(t);
    }, []);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErro(""); setLoading(true);
        const res = await login(new FormData(e.currentTarget));
        setLoading(false);
        if (res?.erro) setErro(res.erro);
    }

    return (
        <div className="fixed inset-0 overflow-hidden">

            {/* ── Splash overlay ── */}
            <div className={`absolute inset - 0 z - 50 flex items - center justify - center bg - black transition - all duration - 700 ease -in -out ${isLoaded ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100"
                } `}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/logo-viagion.png"
                    alt="Viagi On"
                    className="w-56 md:w-72 animate-pulse drop-shadow-2xl"
                    style={{ filter: "drop-shadow(0 0 32px rgba(236,72,153,0.5))" }}
                />
            </div>

            {/* ── Split-screen login ── */}
            <div className={`flex h - full transition - all duration - 700 ease - out delay - 300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                } `}>

                {/* LEFT — branding */}
                <div className="hidden lg:flex w-1/2 bg-black items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[480px] h-[480px] rounded-full bg-pink-900/30 blur-[80px]" />
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/logo-viagion.png"
                        alt="Viagi On"
                        className="w-72 relative z-10 drop-shadow-2xl"
                    />
                </div>

                {/* RIGHT — form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-gray-50 overflow-y-auto">
                    <div className="w-full max-w-md font-sans">

                        {/* Mobile logo */}
                        <div className="flex justify-center mb-8 lg:hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logo-viagion.png" alt="Viagi On" className="w-36 bg-black rounded-xl p-3 object-contain" />
                        </div>

                        <div className="mb-10">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2 leading-tight">
                                Bem-vindo de volta
                            </h1>
                            <p className="text-sm text-gray-500 font-medium">
                                Acesse o painel de comando da sua agência.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    E-mail corporativo
                                </label>
                                <input
                                    type="email" name="email" required autoFocus
                                    placeholder="exemplo@suaagencia.com.br"
                                    className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-sm font-medium shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                                    Senha
                                </label>
                                <input
                                    type="password" name="senha" required
                                    placeholder="••••••••"
                                    className="w-full px-4 py-4 rounded-xl bg-white border border-gray-200 text-sm font-medium shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/5 transition-all"
                                />
                            </div>

                            {erro && (
                                <div style={{ marginBottom: "16px", padding: "12px", borderRadius: "8px", backgroundColor: "#fef2f2", border: "1px solid #fee2e2", color: "#dc2626", fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <AlertTriangle size={16} /> {erro}
                                </div>
                            )}

                            <button
                                type="submit" disabled={loading}
                                className="w-full py-4 mt-1 bg-gray-900 hover:bg-gray-700 text-white font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Autenticando…
                                    </>
                                ) : "Acessar Sistema →"}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-400">
                            Ainda não tem conta?{" "}
                            <Link href="/registro" className="text-gray-900 font-black hover:underline">
                                Registrar agência
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

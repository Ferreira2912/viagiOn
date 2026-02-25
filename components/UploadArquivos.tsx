"use client";
import React, { useRef, useState, useEffect } from "react";
import { uploadArquivoVeiculo, buscarArquivosVeiculo, deletarArquivoVeiculo } from "../app/actions/arquivos";
import { Image as ImageIcon, FileText, Paperclip, FolderClosed, Upload, FolderOpen, X } from "lucide-react";

function getIcon(tipo: string) {
    if (tipo.startsWith("image/")) return <ImageIcon size={20} color="#3b82f6" />;
    if (tipo === "application/pdf") return <FileText size={20} color="#dc2626" />;
    return <Paperclip size={20} color="#9ca3af" />;
}

export default function UploadArquivos({ veiculoId }: { veiculoId: string }) {
    const [arquivos, setArquivos] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [buscando, setBuscando] = useState(true);
    const [erro, setErro] = useState("");
    const formRef = useRef<HTMLFormElement>(null);
    const [file, setFile] = useState<File | null>(null); // Added state for file input

    async function carregar() {
        setBuscando(true);
        const dados = await buscarArquivosVeiculo(veiculoId);
        setArquivos(dados);
        setBuscando(false);
    }

    useEffect(() => { if (veiculoId) carregar(); }, [veiculoId]);

    async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErro(""); setLoading(true);
        const fd = new FormData(e.currentTarget);
        fd.set("veiculoId", veiculoId);
        const res = await uploadArquivoVeiculo(fd);
        setLoading(false);
        if (res?.erro) { setErro(res.erro); return; }
        formRef.current?.reset();
        await carregar();
    }

    async function handleDeletar(arq: any) {
        if (!window.confirm(`Excluir "${arq.nome}"?`)) return;
        await deletarArquivoVeiculo(arq.id, arq.url);
        await carregar();
    }

    if (!veiculoId) return null;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "sans-serif" }}>

            {/* Upload form */}
            <form ref={formRef} onSubmit={handleUpload} style={{ background: "#f0fdf4", border: "2px dashed #86efac", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                        <FolderClosed size={28} color="#9ca3af" />
                    </div>
                    <p style={{ margin: 0, fontSize: "13px", fontWeight: "600", color: "#374151" }}>Fotos do Veículo, PDFs de Laudos, CRLV, ANTT…</p>
                    <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#9ca3af" }}>Qualquer formato aceito pelo Supabase Storage</p>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center", width: "100%", maxWidth: "500px" }}>
                    <input
                        type="file"
                        name="file"
                        required
                        style={{ flex: 1, fontSize: "13px", color: "#374151", cursor: "pointer" }}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        style={{ padding: "8px 16px", backgroundColor: "#111827", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "700", fontSize: "13px", cursor: "pointer", opacity: loading ? 0.5 : 1, display: "flex", alignItems: "center", gap: "6px" }}
                    >
                        {loading ? "Enviando…" : <><Upload size={14} /> Salvar</>}
                    </button>
                </div>

                {erro && <p style={{ margin: 0, color: "#dc2626", fontSize: "12px", fontWeight: "600" }}>{erro}</p>}
            </form>

            {/* File list */}
            <div style={{ background: "#fff", borderRadius: "10px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                        <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e5e7eb" }}>
                            <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase" }}>Arquivo</th>
                            <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "11px", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", width: "110px" }}>Data</th>
                            <th style={{ padding: "10px 14px", width: "80px" }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {buscando ? (
                            <tr><td colSpan={3} style={{ padding: "24px", textAlign: "center", color: "#9ca3af" }}>Carregando…</td></tr>
                        ) : arquivos.length === 0 ? (
                            <tr>
                                <td colSpan={3} style={{ padding: "28px", textAlign: "center", color: "#9ca3af" }}>
                                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "4px" }}>
                                        <FolderOpen size={22} color="#9ca3af" />
                                    </div>
                                    <p style={{ margin: 0, fontSize: "13px" }}>Nenhum arquivo anexado ainda</p>
                                </td>
                            </tr>
                        ) : (
                            arquivos.map((arq) => (
                                <tr key={arq.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "11px 14px" }}>
                                        <a
                                            href={arq.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2563eb", textDecoration: "none", fontWeight: "600" }}
                                        >
                                            <span style={{ fontSize: "18px", flexShrink: 0 }}>{getIcon(arq.tipo)}</span>
                                            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{arq.nome}</span>
                                        </a>
                                    </td>
                                    <td style={{ padding: "11px 14px", color: "#9ca3af", fontSize: "12px", whiteSpace: "nowrap" }}>
                                        {new Date(arq.criado_em).toLocaleDateString("pt-BR")}
                                    </td>
                                    <td style={{ padding: "11px 14px", textAlign: "right" }}>
                                        <button
                                            onClick={() => handleDeletar(arq)}
                                            style={{ padding: "4px 8px", backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }} // Updated styles
                                        >
                                            <X size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {arquivos.length > 0 && (
                <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>{arquivos.length} arquivo(s) • Clique no nome para abrir numa nova aba</p>
            )}
        </div>
    );
}

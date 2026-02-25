"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Building2, Hourglass, RefreshCw, Trash2 } from "lucide-react";
import { uploadLogoEmpresa } from "../app/actions/empresa";

export default function UploadLogo({ logoAtual }: { logoAtual?: string | null }) {
    const [preview, setPreview] = useState<string>(logoAtual || "");
    const [uploading, setUploading] = useState(false);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    async function processFile(file: File) {
        if (!file.type.startsWith("image/")) {
            alert("Por favor, selecione uma imagem (PNG, JPG, SVG, etc.)");
            return;
        }
        // Optimistic local preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target?.result as string);
        reader.readAsDataURL(file);

        setUploading(true);
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadLogoEmpresa(fd);
        setUploading(false);

        if (res?.erro) {
            alert("Erro no upload: " + res.erro);
            setPreview(logoAtual || "");
        }
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) processFile(file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) processFile(file);
    }

    const border = dragging ? "2px dashed #6366f1" : "2px dashed #d1d5db";
    const bg = dragging ? "#f5f3ff" : "#f9fafb";

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "#374151" }}>
                Logo da Empresa
            </label>

            {/* Drop zone */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                style={{
                    border,
                    borderRadius: "10px",
                    background: bg,
                    padding: "20px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "10px",
                    transition: "all 0.15s",
                    minHeight: "100px",
                    justifyContent: "center",
                }}
            >
                {preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={preview}
                        alt="Logo preview"
                        style={{ maxHeight: "80px", maxWidth: "240px", objectFit: "contain", borderRadius: "6px" }}
                    />
                ) : (
                    <>
                        <div style={{ width: "80px", height: "80px", borderRadius: "12px", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #d1d5db" }}>
                            <Building2 size={32} color="#9ca3af" />
                        </div>
                        <p style={{ margin: 0, fontSize: "13px", color: "#6b7280", textAlign: "center" }}>
                            Arraste uma imagem aqui ou<br />
                            <strong style={{ color: "#6366f1" }}>clique para selecionar</strong>
                        </p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#9ca3af" }}>PNG, JPG, SVG — max 5 MB</p>
                    </>
                )}
                {uploading && (
                    <div style={{ padding: "10px 24px", background: "#f3f4f6", borderRadius: "8px", fontWeight: "700", fontSize: "13px", color: "#6b7280", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Hourglass size={14} /> Enviando...
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                style={{ display: "none" }}
            />

            {/* Inline actions */}
            {preview && (
                <div style={{ display: "flex", gap: "8px" }}>
                    <label
                        htmlFor="file-upload"
                        onClick={() => inputRef.current?.click()}
                        style={{ cursor: "pointer", padding: "8px 16px", backgroundColor: "#f3f4f6", color: "#374151", borderRadius: "8px", fontSize: "13px", fontWeight: "700", border: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                        <RefreshCw size={14} /> Trocar logo
                    </label>
                    <button
                        type="button"
                        onClick={() => setPreview("")}
                        style={{ cursor: "pointer", padding: "8px 16px", backgroundColor: "#fef2f2", color: "#dc2626", borderRadius: "8px", fontSize: "13px", fontWeight: "700", border: "1px solid #fecaca", display: "flex", alignItems: "center", gap: "6px" }}
                    >
                        <Trash2 size={14} /> Remover
                    </button>
                </div>
            )}
        </div>
    );
}

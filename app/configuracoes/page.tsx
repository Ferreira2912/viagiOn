import prisma from "../../lib/prisma";
import { getSession } from "../../lib/auth";
import { redirect } from "next/navigation";
import { atualizarEmpresa } from "../actions/empresa";
import Link from "next/link";
import UploadLogo from "../../components/UploadLogo";
import { Settings, Bus, Building2, Palette, Save } from "lucide-react";

export default async function ConfiguracoesPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const empresaRaw = await prisma.empresa.findUnique({ where: { id: session.empresaId as string } });
    if (!empresaRaw) redirect("/login");
    const empresa: any = JSON.parse(JSON.stringify(empresaRaw));

    const inp: React.CSSProperties = { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", width: "100%", boxSizing: "border-box" as any, fontFamily: "sans-serif", background: "#f9fafb" };
    const lbl: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: "700", color: "#374151", marginBottom: "6px" };

    return (
        <div style={{ fontFamily: "sans-serif", maxWidth: "680px" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "32px" }}>
                <div>
                    <h1 style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: "800", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Settings size={24} /> Configurações da Empresa
                    </h1>
                    <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>Personalize as informações e a aparência do seu painel.</p>
                </div>
            </div>

            {/* Preview card */}
            <div style={{ padding: "16px 20px", background: "#111827", borderRadius: "12px", marginBottom: "28px", display: "flex", alignItems: "center", gap: "16px" }}>
                {empresa.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={empresa.logo_url} alt="Logo" style={{ height: "48px", objectFit: "contain", borderRadius: "4px" }} />
                ) : (
                    <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: empresa.cor_primaria || "#831843", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Bus size={24} color="#fff" />
                    </div>
                )}
                <div>
                    <p style={{ margin: "0 0 2px", fontSize: "18px", fontWeight: "800", color: "#fff" }}>{empresa.nome_fantasia}</p>
                    {empresa.razao_social && <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>{empresa.razao_social}</p>}
                    {empresa.cnpj && <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", fontFamily: "monospace" }}>{empresa.cnpj}</p>}
                </div>
            </div>

            {/* Form */}
            <form action={atualizarEmpresa} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", display: "flex", flexDirection: "column", gap: "18px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

                {/* Row 1: Dados cadastrais & Identidade Visual */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
                    {/* Dados */}
                    <div style={{ padding: "24px", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
                        <p style={{ margin: "0 0 14px", fontSize: "11px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}><Building2 size={14} /> Identidade</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            <div>
                                <label style={lbl}>Nome Fantasia *</label>
                                <input type="text" name="nome_fantasia" required defaultValue={empresa.nome_fantasia} style={inp} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                <div>
                                    <label style={lbl}>Razão Social</label>
                                    <input type="text" name="razao_social" defaultValue={empresa.razao_social || ""} style={inp} />
                                </div>
                                <div>
                                    <label style={lbl}>CNPJ</label>
                                    <input type="text" name="cnpj" defaultValue={empresa.cnpj || ""} placeholder="00.000.000/0001-00" style={inp} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Aparência */}
                    <div style={{ padding: "24px", backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)", border: "1px solid #e5e7eb" }}>
                        <p style={{ margin: "0 0 14px", fontSize: "11px", fontWeight: "800", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "4px" }}><Palette size={14} /> Aparência</p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                            {/* Logo upload — standalone, outside the main form submit */}
                            <UploadLogo logoAtual={empresa.logo_url} />
                            <div style={{ display: "flex", alignItems: "flex-end", gap: "12px" }}>
                                <div>
                                    <label style={lbl}>Cor Primária</label>
                                    <input type="color" name="cor_primaria" defaultValue={empresa.cor_primaria || "#831843"} style={{ height: "42px", width: "60px", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", padding: "2px" }} />
                                </div>
                                <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af", paddingBottom: "10px" }}>Cor usada na pré-visualização e documentos</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: "32px", display: "flex", justifyContent: "flex-end" }}>
                    <button type="submit" style={{ padding: "12px 32px", backgroundColor: "#111827", color: "#fff", border: "none", borderRadius: "8px", fontWeight: "800", fontSize: "14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Save size={16} /> Salvar Configurações
                    </button>
                </div>
            </form>
        </div>
    );
}

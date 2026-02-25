"use client";
import { useEffect } from "react";

export default function PrintButton() {
    return (
        <div style={{ position: "fixed", bottom: "32px", right: "32px" }} className="print:hidden">
            <button
                onClick={() => window.print()}
                style={{ background: "#111827", color: "#fff", padding: "14px 28px", borderRadius: "999px", fontWeight: "800", fontSize: "14px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)" }}
            >
                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir Relatório
            </button>
        </div>
    );
}

"use client";
import { useState, useEffect } from "react";

export default function CookieConsent() {
  const STORAGE_KEY = "cookie_consent_v1";
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setShow(true);
  }, []);

  const handleConsent = (type: "necessary" | "all") => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accepted: true,
        type,
        date: new Date().toISOString(),
      })
    );
    setShow(false);

    // Ejemplo: podrías ejecutar scripts aquí si aceptan todas
    if (type === "all") {
      window.dispatchEvent(new Event("cookies:accepted"));
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.55)",
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #7b5ca2, #6a4a8d)",
          color: "#faf5e5",
          padding: "2rem",
          borderRadius: "16px",
          boxShadow: "0 8px 40px rgba(123,92,162,0.3)",
          maxWidth: "480px",
          width: "90%",
          textAlign: "center",
          animation: "fadeIn .3s ease",
        }}
      >
        <h2 style={{ marginBottom: "0.5rem" }}>🍪 Preferencias de Cookies</h2>
        <p style={{ fontSize: "0.95rem", lineHeight: "1.4" }}>
          Usamos cookies para mejorar tu experiencia en nuestro sitio. Puedes
          aceptar solo las necesarias o todas las cookies.  
          Consulta nuestras{" "}
          <a
            href="/politicas-de-compra"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#d8c4fa",
              textDecoration: "underline",
              textUnderlineOffset: "3px",
            }}
          >
            Políticas de compra
          </a>
          .
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <button
            onClick={() => handleConsent("necessary")}
            style={{
              backgroundColor: "transparent",
              border: "1px solid rgba(250,245,229,0.25)",
              color: "#faf5e5",
              padding: "0.6rem 1rem",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s",
            }}
          >
            Solo necesarias
          </button>
          <button
            onClick={() => handleConsent("all")}
            style={{
              backgroundColor: "#d8c4fa",
              color: "#7b5ca2",
              padding: "0.6rem 1rem",
              borderRadius: "10px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "0.2s",
              border: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#e6dff1")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#d8c4fa")
            }
          >
            Aceptar todas las cookies
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

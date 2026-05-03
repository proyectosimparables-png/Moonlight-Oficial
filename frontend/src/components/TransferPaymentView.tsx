"use client";

import { useState } from "react";
import { Check, Copy, Hourglass, ArrowLeft } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

// Constantes fuera del componente para mayor prolijidad
const BANK_DETAILS = {
  cvu: "0000003100018425717971",
  alias: "Moonlight.13.06",
  titular: "CASCO MARIELA ROCIO",
  cuit: "27426174508",
};

interface Props {
  params: { id: string };
}

export default function OrderSuccessPage({ params }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Notificación visual profesional
      toast.success("¡CVU copiado al portapapeles!", {
        icon: "📋",
        style: {
          borderRadius: "10px",
          background: "#8b5cf6",
          color: "#fff",
        },
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("No se pudo copiar el código");
      console.error("Failed to copy:", err);
    }
  };

  return (
    <main className="min-h-screen bg-[#fcfaf2] py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Encabezado */}
        <header className="space-y-2">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Orden: #{params.id}
          </p>
          <div className="flex items-center gap-3 text-[#8b5cf6]">
            <Hourglass className="h-6 w-6 animate-pulse" />
            <h1 className="text-2xl font-bold italic">En espera de pago</h1>
          </div>
          <p className="text-lg">¡Hola! 💜</p>
        </header>

        {/* Cuerpo del mensaje */}
        <section className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Gracias por tu compra y por confiar en nosotras! 🌙✨
            <br />
            Si elegiste abonar por transferencia bancaria, te dejamos acá los
            datos:
          </p>

          {/* Card de Datos Bancarios */}
          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-sm space-y-3">
            <div className="flex justify-between items-center group">
              <p className="font-mono text-sm break-all">
                <span className="font-sans font-semibold text-gray-500">
                  CVU:
                </span>{" "}
                {BANK_DETAILS.cvu}
              </p>
              <button
                onClick={() => handleCopy(BANK_DETAILS.cvu)}
                className="p-2 hover:bg-purple-50 rounded-full transition-colors text-[#8b5cf6]"
                title="Copiar CVU"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
            <p>
              <span className="font-semibold text-gray-500">Alias:</span>{" "}
              {BANK_DETAILS.alias}
            </p>
            <p>
              <span className="font-semibold text-gray-500">
                Titular de cuenta:
              </span>{" "}
              {BANK_DETAILS.titular}
            </p>
            <p>
              <span className="font-semibold text-gray-500">CUIT:</span>{" "}
              {BANK_DETAILS.cuit}
            </p>
          </div>

          <p className="text-sm bg-purple-50 p-4 rounded-lg border-l-4 border-[#8b5cf6]">
            Una vez que realices la transferencia, no te olvides de enviarnos el
            comprobante de pago por
            <span className="font-bold"> WhatsApp o Instagram</span> para poder
            confirmar tu pedido.
          </p>

          <div className="pt-4">
            <p>Gracias por elegirnos 💜</p>
            <p className="font-bold italic mt-2">🌙 Caro y Maru ✨</p>
          </div>
        </section>

        {/* Acciones Finales */}
        <footer className="flex flex-col gap-4 pt-6 border-t border-purple-100">
          <button
            onClick={() => handleCopy(BANK_DETAILS.cvu)}
            className="w-full bg-[#8b5cf6] hover:bg-[#7c4dff] text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Copy className="h-5 w-5" />
            Copiar CVU
          </button>

          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#8b5cf6] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Cambiar medio de pago
          </Link>
        </footer>
      </div>
    </main>
  );
}

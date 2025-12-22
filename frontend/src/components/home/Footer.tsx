"use client";

import { useState } from "react";
import {
  FaInstagram,
  FaWhatsapp,
  FaTiktok,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus("enviando...");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/mail/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setStatus("¡Gracias por unirte!");
        setEmail("");
      } else {
        setStatus("Ocurrió un error.");
      }
    } catch (err) {
      setStatus("Error al enviar.");
    }
  };

  return (
    <footer
      className="pt-12 pb-20 mt-16"
      style={{
        backgroundColor: "var(--color-lilac)",
        color: "var(--color-dark)",
      }}
    >
      <div className="container mx-auto px-4">
        {/* Fila principal */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-12">
          {/* Formulario suscripción */}
          <div className="flex-1 flex flex-col items-start">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl lg:text-3xl font-bold text-[var(--color-dark)]">
                Suscribite para recibir novedades
              </h2>
              <span className="text-3xl text-[#6c2bd3]">💜</span>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 w-full"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu email..."
                className="w-full p-3 border border-[var(--color-dark)] rounded bg-white text-black"
              />

              <button
                type="submit"
                className="self-start bg-[var(--color-dark)] text-white px-6 py-2 rounded hover:bg-[var(--color-lilac)] hover:text-[var(--color-dark)] transition"
              >
                Enviar
              </button>

              {status && (
                <p className="mt-2 text-[var(--color-dark)]">{status}</p>
              )}
            </form>
          </div>

          {/* Redes sociales */}
          <div className="flex-1 flex flex-col items-center gap-4">
            <h3 className="text-xl font-semibold text-[var(--color-dark)]">
              ¡Seguinos en nuestras redes!
            </h3>

            <div className="flex gap-8 text-3xl text-[var(--color-dark)]">
              <a
                href="https://www.instagram.com/moonlightestampas/"
                target="_blank"
                className="hover:text-white transition"
              >
                <FaInstagram />
              </a>
              <a
                href="https://wa.me/542226622903"
                target="_blank"
                className="hover:text-white transition"
              >
                <FaWhatsapp />
              </a>
              <a href="tel:2226622903" className="hover:text-white transition">
                <FaPhone />
              </a>
              <a
                href="mailto:moonlightestampas@gmail.com"
                className="hover:text-white transition"
              >
                <FaEnvelope />
              </a>
              <a
                href="https://www.tiktok.com/@tiendamoonlight"
                target="_blank"
                className="hover:text-white transition"
              >
                <FaTiktok />
              </a>
            </div>

            <p className="mt-2 text-sm text-[var(--color-dark)]">
              moonlightestampas@gmail.com
            </p>
          </div>

          {/* Medios de pago */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-4 text-center lg:text-left text-[var(--color-dark)]">
              Medios de pago
            </h3>

            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              {[
                "/visa.png",
                "/mastercard.png",
                "/mercado-pago.png",
                "/Rapipago.png",
                "/pago-facil.png",
                "/cmr-falabella.png",
                "/tarjeta-naranja.png",
                "/Cabal.png",
                "/diners-club.png",
                "/tarjeta-argencard.png",
                "/tarjeta-shopping.png",
                "/red-banelco.png",
                "/cabal Debito.png",
                "/paypal-logo.png",
                "/tarjeta-nativa.png",
              ].map((src) => (
                <div
                  key={src}
                  className="w-16 h-16 bg-white rounded-md shadow flex items-center justify-center p-2"
                >
                  <img
                    src={src}
                    alt="Método de pago"
                    className="w-full h-full object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Métodos de envío */}
        <div className="text-center mt-16">
          <h3 className="text-lg font-semibold mb-6 text-[var(--color-dark)]">
            Métodos de envío
          </h3>

          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <Image
              src="/correo-argentino.png"
              alt="Correo Argentino"
              width={180}
              height={80}
              className="drop-shadow-md"
            />
          </motion.div>

          <p className="mt-4 text-md text-[var(--color-dark)]">
            Por correo argentino a sucursal y a domicilio, o retiros por
            Moonlight Point a coordinar (Moron, Ituzaingo, Once, Recoleta)
          </p>
        </div>

        {/* Derechos reservados */}
        <div className="text-center text-sm mt-12 text-[var(--color-dark)]">
          © {new Date().getFullYear()} - Moonlight. Todos los derechos
          reservados.
        </div>
      </div>
    </footer>
  );
}

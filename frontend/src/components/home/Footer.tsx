"use client";

import { useState } from "react";
import { FaInstagram, FaWhatsapp, FaTiktok, FaPhone, FaEnvelope } from "react-icons/fa";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const paymentMethods = [
    "/visa.png",
    "/mastercard.png",
    "/mercado-pago.png",
    "/Rapipago.png",
    "/pago-facil.png",
    "/cmr-falabella.png",
    "/diners-club.png",
    "/tarjeta-shopping.png",
    "/tarjeta-nativa.png",
    "/tarjeta-naranja.png",
    "/tarjeta-argencard.png",
    "/red-banelco.png",
    "/paypal-logo.png",
    "/cencosud.png",
    "/Cabal.png",
    "/cabal Debito.png",
    "/American.png",
  ];

  // 📩 Enviar formulario al backend
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setStatus("enviando...");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/mail/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

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
    <footer className="bg-[var(--color-soft-beige)] pt-12 pb-20 mt-16">
      <div className="container mx-auto px-4">

        {/* FORMULARIO DE SUSCRIPCIÓN */}
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold text-[var(--color-dark)] mb-4">
            UNITE A #MOONLIGHTCLUB PARA ENTERARTE DE TODO
          </h2>

          <div className="flex justify-center text-5xl mb-6 text-[var(--color-dark)]">
            💜
          </div>

          <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto flex flex-col gap-4"
          >
            <label className="text-left text-[var(--color-dark)] font-semibold">
              Email
            </label>

            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Necesitamos tu email para enviarte nuestras novedades."
              className="w-full p-3 border border-[var(--color-dark)] rounded bg-white"
            />

            <button
              type="submit"
              className="self-end bg-[var(--color-dark)] text-white px-6 py-2 rounded hover:bg-[var(--color-lilac)] transition"
            >
              Enviar
            </button>

            {status && (
              <p className="text-center text-[var(--color-dark)] mt-2">
                {status}
              </p>
            )}
          </form>
        </div>

        {/* Redes sociales */}
        <div className="flex flex-col items-center gap-4 mb-12">
          <h3 className="text-xl font-semibold text-[var(--color-dark)]">
            ¡Seguinos en nuestras redes!
          </h3>

          <div className="flex gap-8 text-3xl text-[var(--color-dark)]">
            <a href="https://www.instagram.com/moonlightestampas/" target="_blank" className="hover:text-[var(--color-lilac)] transition">
              <FaInstagram />
            </a>
            <a href="https://wa.me/542226622903" target="_blank" className="hover:text-[var(--color-lilac)] transition">
              <FaWhatsapp />
            </a>
            <a href="tel:2226622903" className="hover:text-[var(--color-lilac)] transition">
              <FaPhone />
            </a>
            <a href="mailto:moonlightestampas@gmail.com" className="hover:text-[var(--color-lilac)] transition">
              <FaEnvelope />
            </a>
            <a href="https://www.tiktok.com/@tiendamoonlight" target="_blank" className="hover:text-[var(--color-lilac)] transition">
              <FaTiktok />
            </a>
          </div>

          <p className="text-[var(--color-dark)] mt-2 text-sm">
            moonlightestampas@gmail.com
          </p>
        </div>

        {/* Métodos de pago */}
      <div className="mt-10">
  <h3 className="text-lg font-semibold text-[var(--color-dark)] mb-4 text-center">
    Medios de pago
  </h3>

  {/* GRID DE TARJETAS */}
  <div className="flex flex-col items-center gap-4">

    {/* FILA 1 – 8 tarjetas */}
    <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
      {[
        "/visa.png",
        "/mastercard.png",
        "/mercado-pago.png",
        "/Rapipago.png",
        "/pago-facil.png",
        "/cmr-falabella.png",
        "/tarjeta-naranja.png",
        "/Cabal.png",
      ].map((src) => (
        <div
          key={src}
          className="w-16 h-16 bg-white rounded-md shadow flex items-center justify-center p-2"
        >
          <img src={src} alt="Método de pago" className="w-full h-full object-contain" />
        </div>
      ))}
    </div>

    {/* FILA 2 – 7 tarjetas */}
    <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
      {[
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
          <img src={src} alt="Método de pago" className="w-full h-full object-contain" />
        </div>
      ))}
    </div>

  </div>
</div>


        {/* Métodos de envío */}
        <div className="text-center mb-16">
          <h3 className="text-lg font-semibold text-[var(--color-dark)] mb-6">
            Métodos de envío
          </h3>

          <motion.div whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} className="flex justify-center">
            <Image
              src="/correo-argentino.png"
              alt="Correo Argentino"
              width={180}
              height={80}
              className="drop-shadow-md"
            />
          </motion.div>

          <p className="text-[var(--color-dark)] mt-4 text-md">
            También podés retirar por domicilio
          </p>
        </div>

        {/* Derechos reservados */}
        <div className="text-center text-sm text-[var(--color-dark)]">
          © {new Date().getFullYear()} - Moonlight. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}

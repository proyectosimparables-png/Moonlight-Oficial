"use client";

import Image from "next/image";

export default function QuienesSomos() {
  return (
    <section className="min-h-screen bg-transparent py-12 px-6 md:px-12 animate-fadeIn">
      {/* 🩵 Encabezado */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)]">
          💫 ¿Quiénes Somos?
        </h1>
      </div>

      {/* 💜 Contenedor principal */}
      <div className="max-w-5xl mx-auto bg-[var(--color-pastel-lilac)] border border-[var(--color-hover)] rounded-2xl shadow-lg p-8 md:p-10 flex flex-col md:flex-row items-center gap-10">
        {/* 🖼️ Imagen principal */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-6 items-center justify-center w-full md:w-1/2">
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 rounded-xl overflow-hidden shadow-md hover:scale-[1.03] transition-transform duration-300">
            <Image
              src="/Caro.png" 
              alt="Caro - Fundadora de Moonlight"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 rounded-xl overflow-hidden shadow-md hover:scale-[1.03] transition-transform duration-300">
            <Image
              src="/maru.png" 
              alt="Maru - Fundadora de Moonlight"
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* 🪐 Texto */}
        <div className="w-full md:w-1/2 text-gray-800 leading-relaxed space-y-4">
          <p className="text-lg">
            Hola! Somos <strong>Caro y Maru</strong>, hermanas y socias fundadoras de <strong>Moonlight</strong>. Tenemos 30 y 25 años, respectivamente, y somos el agua y el aceite.
          </p>
          <p>
            La Sirenita y Mulán, colores pasteles y negro, piscis y tauro, Gryffindor y Slytherin. Bueno, supongo que ya van entendiendo 😄.
          </p>
          <p>
            Nos complementamos muy bien y aunque seamos polos opuestos, hay algo que amamos y tenemos en común: <strong>BTS</strong>. Somos Armys desde el 2019, cuando escuchamos por primera vez <em>Boy with Luv</em> — y el resto es historia 💜.
          </p>
          <p>
            En el 2021 comenzamos a soñar nuestro emprendimiento. Queríamos disfrutar de lo que hacíamos, y qué mejor que hacerlo juntas, creando algo que amamos.
          </p>
          <p>
            En <strong>Moonlight</strong> vas a encontrar prendas sin género, de calidad premium y una amplia variedad de talles. Cada diseño busca acercarte un poquito más a tu artista favorito, y está hecho con mucho amor.
          </p>
          <p className="font-medium text-[var(--color-dark)]">
            💫 ¡Te invitamos a formar parte de esta experiencia!
          </p>
        </div>
      </div>

      {/* 🌸 Animación */}
      <style jsx>{`
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
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }
      `}</style>
    </section>
  );
}

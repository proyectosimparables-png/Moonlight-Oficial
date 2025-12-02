"use client";

export default function Mayoristas() {
  const items = [
    "Los precios por mayor son a partir de 10 prendas, estas pueden ser surtidas, de distintos talles y colores.",
    "No hacemos pedidos mayoristas de nuestros diseños bajo ningún término ni condición, ya que son exclusivos de nuestra marca. Es decir que tendrás que enviarnos los diseños a estampar.",
    "Para iniciar la producción, necesitamos una seña del 50% del total, sin excepciones. Se puede abonar en efectivo o transferencia bancaria.",
    "Nuestro tiempo de producción para pedidos mayoristas es de 15 a 20 días hábiles (no incluye fines de semana ni feriados).",
    "Trabajamos con 3 calidades de algodón (cardado, mercerizado y peinado), de las cuales siempre te vamos a comentar las características, ventajas y desventajas de cada uno. Nuestra recomendación es utilizar siempre Algodón Peinado 24.1.",
    "Para armarte un presupuesto exacto, necesitamos que nos envíes los diseños a estampar, con las especificaciones de tamaño y ubicación correspondientes, cantidad de prendas, talles y colores. Es muy importante, ya que estos son los factores que determinan el precio final por unidad.",
    "La técnica de estampado con la que trabajamos es: DTF.",
  ];

  return (
    <section className="min-h-screen bg-[var(--color-soft-beige)] py-12 px-6 md:px-12 animate-fadeIn">
      {/* 💜 Encabezado */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)]">
          🛍️ Mayoristas
        </h1>
        <p className="text-[var(--color-dark)] mt-3 text-lg">
          Hola! ¿Cómo estás? Te contamos todo lo que necesitás saber a la hora de hacernos un pedido mayorista:
        </p>
      </div>

      {/* 🪄 Lista de ítems */}
      <div className="max-w-4xl mx-auto grid gap-6 md:gap-8">
        {items.map((texto, index) => (
          <div
            key={index}
            className="relative flex flex-col md:flex-row items-start md:items-center gap-4 bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* 🔮 Icono animado */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-dark)] text-white font-bold text-lg shadow-md flex-shrink-0 animate-bounce-slow">
              {index + 1}
            </div>

            {/* Texto */}
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              {texto}
            </p>
          </div>
        ))}
      </div>

      {/* 🐶 Mensaje final */}
      <div className="text-center mt-12 text-[var(--color-dark)]">
        <p className="text-lg font-medium mb-2">
          Si te queda alguna duda que no respondimos en los ítems anteriores, no dudes en
          consultarnos por cualquiera de nuestros canales de comunicación!
        </p>
        <p className="text-sm italic mt-2">
          Con cariño, <br /> El team de <strong>Moonlight</strong> (y el jefe 🐶)
        </p>
      </div>

      {/* 🌸 Animaciones */}
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

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}

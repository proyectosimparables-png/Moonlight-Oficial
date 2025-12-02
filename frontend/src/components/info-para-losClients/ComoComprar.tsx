"use client";

export default function ComoComprar() {
  const pasos = [
    {
      numero: "1",
      titulo: "Elige tu producto",
      descripcion:
        "Navega por las categorías o usa el buscador para encontrar lo que deseas.",
    },
    {
      numero: "2",
      titulo: "Agrega al carrito",
      descripcion:
        "Haz clic en “Agregar al carrito” para sumar el producto.",
    },
    {
      numero: "3",
      titulo: "Revisa tu carrito",
      descripcion:
        "Verifica los productos y cantidades antes de continuar.",
    },
    {
      numero: "4",
      titulo: "Completa tus datos",
      descripcion:
        "Ingresa tu información personal y dirección de envío.",
    },
    {
      numero: "5",
      titulo: "Selecciona el método de pago",
      descripcion:
        "Elige la opción que más te convenga entre nuestras alternativas.",
    },
    {
      numero: "6",
      titulo: "Confirma tu compra",
      descripcion:
        "Revisa todo y haz clic en “Finalizar compra”.",
    },
    {
      numero: "7",
      titulo: "Recibe tu pedido",
      descripcion:
        "Te enviaremos un email con los detalles y seguimiento del envío.",
    },
  ];

  return (
    <section className="min-h-screen bg-[var(--color-soft-beige)] py-12 px-6 md:px-12 animate-fadeIn">
      {/* 🌙 Encabezado */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)]">
          🛍️ ¿Cómo realizar una compra?
        </h1>
        <p className="text-[var(--color-dark)] mt-3 text-lg">
          Comprar en nuestra tienda es <strong>fácil y rápido</strong>. Seguí estos pasos:
        </p>
      </div>

      {/* 🪞 Lista de pasos */}
      <div className="max-w-4xl mx-auto grid gap-6 md:gap-8">
        {pasos.map((paso) => (
          <div
            key={paso.numero}
            className="relative flex flex-col md:flex-row items-start md:items-center gap-4 bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
          >
            {/* 🔵 Número animado */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-dark)] text-white font-bold text-xl shadow-md flex-shrink-0 animate-bounce-slow">
              {paso.numero}
            </div>

            {/* Texto */}
            <div>
              <h3 className="text-lg md:text-xl font-semibold text-[var(--color-dark)]">
                {paso.titulo}
              </h3>
              <p className="text-gray-700 mt-1">{paso.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 🐶 Mensaje final */}
      <div className="text-center mt-12 text-[var(--color-dark)]">
        <p className="text-lg font-medium mb-2">
          ¡Así de sencillo! 💜 Si tenés dudas, comunicate directamente con nosotras
          por cualquiera de nuestras vías de comunicación.
        </p>
        <p className="text-sm italic mt-2">
          Con cariño,<br />El team de <strong>Moonlight</strong> (y el jefe 🐶)
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

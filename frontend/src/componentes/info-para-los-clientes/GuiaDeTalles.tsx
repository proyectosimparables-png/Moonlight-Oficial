"use client";

export default function GuiaDeTalles() {
  const tablas = [
    {
      titulo: "Remeras Clásicas Adultos",
      talles: [
        ["S", "46 cm", "63 cm"],
        ["M", "49 cm", "66 cm"],
        ["L", "53 cm", "68 cm"],
        ["XL", "56 cm", "71 cm"],
        ["XXL", "58 cm", "74 cm"],
        ["3XL", "60 cm", "77 cm"],
        ["4XL", "62 cm", "79 cm"],
        ["5XL", "64 cm", "81 cm"],
      ],
    },
    {
      titulo: "Remeras Oversize Adultos",
      talles: [
        ["S", "57 cm", "72 cm"],
        ["M", "59 cm", "74 cm"],
        ["L", "60 cm", "76 cm"],
        ["XL", "63 cm", "81 cm"],
        ["XXL", "66 cm", "81 cm"],
      ],
    },
    {
      titulo: "Remeras Niños",
      talles: [
        ["4", "33 cm", "43 cm"],
        ["6", "34 cm", "48 cm"],
        ["8", "37 cm", "50 cm"],
        ["10", "39 cm", "52 cm"],
        ["12", "40 cm", "54 cm"],
        ["14", "42 cm", "56 cm"],
        ["16", "45 cm", "61 cm"],
      ],
    },
    {
      titulo: "Buzos Cuello Redondo / Hoodies Adultos",
      talles: [
        ["S", "54 cm", "67 cm"],
        ["M", "56 cm", "70 cm"],
        ["L", "58 cm", "73 cm"],
        ["XL", "60 cm", "75 cm"],
        ["XXL", "63 cm", "78 cm"],
      ],
    },
    {
      titulo: "Buzos Cuello Redondo / Hoodies Niños",
      talles: [
        ["10", "40 cm", "50 cm"],
        ["12", "43 cm", "53 cm"],
        ["14", "46 cm", "56 cm"],
        ["16", "48 cm", "59 cm"],
        ["18", "50 cm", "62 cm"],
      ],
    },
    {
      titulo: "Camperas Adultos",
      talles: [
        ["S", "56 cm", "68 cm"],
        ["M", "58 cm", "70 cm"],
        ["L", "60 cm", "73 cm"],
        ["XL", "62 cm", "75 cm"],
        ["XXL", "64 cm", "78 cm"],
      ],
    },
    {
      titulo: "Camperas Niños",
      talles: [
        ["10", "42 cm", "52 cm"],
        ["12", "45 cm", "55 cm"],
        ["14", "48 cm", "59 cm"],
        ["16", "51 cm", "63 cm"],
        ["18", "53 cm", "66 cm"],
      ],
    },
  ];

  return (
    <section className="min-h-screen bg-[var(--color-soft-beige)] py-12 px-6 md:px-12 animate-fadeIn">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)] mb-4">
          📏 Guía de Talles
        </h1>
        <p className="text-[var(--color-dark)] max-w-2xl mx-auto text-lg leading-relaxed">
          Hola a todxs! 💜 Les dejamos 3 tips para que estén segurxs de cómo elegir bien su talle:
        </p>
      </div>

      <div className="max-w-3xl mx-auto text-[var(--color-dark)] mb-12 space-y-3 text-base leading-relaxed">
        <p>1️⃣ Busca una prenda que te quede bien, similar a la que querés comprar.</p>
        <p>2️⃣ Tomá las medidas y comparalas con la tabla de talles. Las medidas son en cm y se toman sobre una prenda plana, no sobre el cuerpo.</p>
        <p>3️⃣ Elegí la prenda que más se adapte a tu gusto y comodidad.</p>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {tablas.map((tabla, index) => (
          <div
            key={index}
            className="bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fadeUp"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-4 text-center">
              {tabla.titulo}
            </h2>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="bg-[var(--color-lilac)] text-white">
                  <th className="p-2">Talle</th>
                  <th className="p-2">Ancho</th>
                  <th className="p-2">Largo</th>
                </tr>
              </thead>
              <tbody>
                {tabla.talles.map(([talle, ancho, largo]) => (
                  <tr key={talle} className="border-b border-[var(--color-lilac)]">
                    <td className="py-2 font-medium">{talle}</td>
                    <td className="py-2">{ancho}</td>
                    <td className="py-2">{largo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      <div className="text-center mt-12 text-[var(--color-dark)]">
        <p className="italic">
          Recordá 💜 las medidas son aproximadas y pueden variar levemente según el modelo.
        </p>
      </div>

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

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-in-out;
        }

        .animate-fadeUp {
          animation: fadeUp 0.6s ease-in-out forwards;
        }
      `}</style>
    </section>
  );
}

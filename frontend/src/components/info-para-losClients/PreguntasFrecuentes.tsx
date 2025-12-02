"use client";

import Image from "next/image";

export default function PreguntasFrecuentes() {
    return (
        <section className="min-h-screen bg-[var(--color-soft-beige)] py-12 px-6 md:px-12 animate-fadeIn">
            {/* 🩵 Encabezado */}
            <div className="text-center mb-10">
          
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)]">
                    💬 Preguntas Frecuentes
                </h1>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
                {/* 🧾 FAQ Item */}
                <div className="bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
                        ¿Qué formas de pago puedo aprovechar para realizar mi compra?
                    </h2>
                    <p className="text-gray-700 mb-4">
                        Disponemos de los siguientes medios de pago:
                    </p>

                    {/* 💳 Logos de medios de pago */}
                    <div className="flex flex-wrap gap-4 items-center justify-start mt-2">
                        <Image src="/Visa.png" alt="Visa" width={60} height={40} />
                        <Image src="/Matercard.png" alt="MaterCard" width={60} height={40} />
                        <Image src="/American.png" alt="American Express" width={60} height={40} />
                        <Image src="/Mercadopago.png" alt="Mercado Pago" width={90} height={40} />
                        <Image src="/Naranja.png" alt="Naranja" width={70} height={40} />
                        <Image src="/Nativa.png" alt="Nativa" width={90} height={40} />
                        <Image src="/PagoFacil.png" alt="Pago Fácil" width={50} height={40} />
                        <Image src="/Paypal.png" alt="PayPal" width={50} height={40} />
                        <Image src="/Rapipago.png" alt="Rapipago" width={50} height={40} />
                        <Image src="/Shopping.png" alt="Shopping" width={50} height={40} />
                        <Image src="/Farabella.png" alt="Farabella" width={50} height={40} />
                        <Image src="/DinersClub.png" alt="Diners Club" width={50} height={40} />
                        <Image src="/Cencosod.png" alt="Cencosod" width={50} height={40} />
                        <Image src="/CabalDbito.png" alt="CabalDbito" width={50} height={40} />
                        <Image src="/ArgenCard.png" alt="Transferencia Bancaria" width={50} height={40} />
                         <Image src="/Banelco.png" alt="Banelco" width={50} height={40} />
                    </div>
                </div>

                {/* 🚚 Envío */}
                <div className="bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
                        ¿Cuál es el costo de envío?
                    </h2>
                    <p className="text-gray-700">
                        El costo de envío será mostrado en base al total de la compra y ubicación, en el checkout, en el momento previo a la compra.
                    </p>
                </div>

                {/* 🏤 Métodos de envío */}
                <div className="bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
                        ¿Cómo se realizan los envíos?
                    </h2>
                    <p className="text-gray-700">
                        Trabajamos con: <strong>Correo Argentino</strong>.
                    </p>
                </div>

                {/* ⏰ Tiempos */}
                <div className="bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
                        ¿Cuánto tarda en llegar el pedido?
                    </h2>
                    <p className="text-gray-700">
                        Nuestro tiempo de producción es de 14 a 17 días hábiles. En el caso de retirar por un Moonlight Point, el día y horario de entrega es a coordinar. Los envíos suelen demorar entre 3 a 6 días hábiles.
                    </p>
                </div>

                {/* 👕 Materiales */}
                <div className="bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
                        ¿De qué material son nuestras prendas?
                    </h2>
                    <p className="text-gray-700">
                        Nuestras remeras están confeccionadas en <strong>algodón peinado 24.1</strong>, y nuestros buzos, hoodies y camperas son de <strong>frisa invisible</strong>. Ambos materiales son de calidad premium, por lo que no se achican ni destiñen con los lavados.
                    </p>
                </div>

                {/* 📦 Stock */}
                <div className="bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
                        ¿Tienen stock para entrega inmediata?
                    </h2>
                    <p className="text-gray-700">
                        Todo lo que tiene un proceso de estampado, es decir, Indumentaria, lo hacemos a pedido y nuestro tiempo de producción es de 14 a 17 días hábiles. En caso de tener productos con stock y entrega inmediata estará especificado en cada descripción.
                    </p>
                </div>

                {/* 📏 Talles */}
                <div className="bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
                        ¿Trabajan talles especiales?
                    </h2>
                    <p className="text-gray-700">
                        Sí, nuestras remeras clásicas vienen del <strong>S al 5XL</strong> de adulto. En cambio los buzos, hoodies y camperas vienen del <strong>S al XXL</strong>. Nuestra tabla de medidas está disponible en la sección <em>Guía de Talles</em>.
                    </p>
                </div>

                {/* 🎨 Técnica */}
                <div className="bg-[var(--color-pastel-lilac)] border border-[var(--color-lilac)] rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-xl font-semibold text-[var(--color-dark)] mb-2">
                        ¿Qué técnicas de estampado usan?
                    </h2>
                    <p className="text-gray-700">Estampamos en <strong>DTF</strong>.</p>
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

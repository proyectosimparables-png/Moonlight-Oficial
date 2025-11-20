"use client";

export default function PoliticasCompra() {
  return (
    <section className="min-h-screen bg-[var(--color-soft-beige)] py-12 px-6 md:px-12 animate-fadeIn">
      {/* Encabezado */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--color-dark)]">
          🛍️ Políticas de compra
        </h1>
      </div>

      <div className="max-w-4xl mx-auto bg-[var(--color-pastel-lilac)] shadow-lg rounded-2xl p-8 border border-[var(--color-hover)]">
        {/* Información general */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-dark)] mb-4">
            Información importante antes de comprar
          </h2>
          <ul className="space-y-3 text-gray-800 leading-relaxed">
            <li>
              • No contamos con stock para entrega inmediata (exceptuando los productos que en su descripción digan <strong>"entrega inmediata"</strong>).  
              Cada prenda es realizada a pedido, con un tiempo de producción de <strong>14 a 17 días hábiles</strong>.
            </li>
            <li>
              • Una vez abonada la compra, tenés <strong>24 hs</strong> para pedir la cancelación o devolución del dinero, o modificar talle o color en caso de error.
            </li>
            <li>• Monto mínimo de compra: <strong>$4000</strong>.</li>
          </ul>
        </section>

        {/* Métodos de Pago */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-dark)] mb-4">
            Métodos de Pago
          </h2>
          <p className="text-gray-800 leading-relaxed mb-3">
            Podés abonar a través de <strong>Pago Nube</strong>, <strong>Mercado Pago</strong>, <strong>Ualá</strong>, <strong>GoCuotas</strong> o <strong>Transferencia Bancaria</strong>.
          </p>
          <p className="text-gray-800 leading-relaxed mb-3">
            Con Pago Nube o Mercado Pago, tenés <strong>3 cuotas sin interés</strong> todos los días con VISA, MASTERCARD y AMEX (excepto Naranja).
          </p>
          <p className="text-gray-800 leading-relaxed">
            Si realizás una transferencia bancaria, tenés un <strong>10% de descuento</strong> en todos los productos.  
            No olvides enviarnos tu comprobante al <strong>WhatsApp: 2226622903</strong>, de lo contrario no podremos confirmar tu pedido.
          </p>
        </section>

        {/* Métodos de Entrega */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-[var(--color-dark)] mb-4">
            Métodos de Entrega
          </h2>
          <ul className="space-y-3 text-gray-800 leading-relaxed">
            <li>
              • Realizamos envíos a todo el país mediante <strong>Correo Argentino</strong> (a domicilio o a sucursal).
            </li>
            <li>
              • Una vez que tu pedido esté listo, te avisaremos por Mail, WhatsApp o Instagram con tu número de seguimiento.
            </li>
            <li>
              • Es <strong>responsabilidad del comprador</strong> verificar el seguimiento del paquete.  
              En caso de no recibirlo, deberá retirarlo en la sucursal indicada antes de 5 días hábiles, o abonar el reenvío.
            </li>
            <li>
              • También podés retirar por <strong>Ituzaingó, Morón, Recoleta u Once</strong>.  
              Las entregas son de lunes a viernes, con horario a coordinar.  
              <strong>No se realizan otros puntos de encuentro.</strong>
            </li>
            <li>
              • No nos hacemos responsables de daños, robos o demoras durante el envío.  
              Los reclamos deben hacerse directamente a la empresa de transporte.
            </li>
          </ul>
        </section>

        {/* Cambios o devoluciones */}
        <section>
          <h2 className="text-2xl font-semibold text-[var(--color-dark)] mb-4">
            Cambios o Devoluciones
          </h2>
          <ul className="space-y-3 text-gray-800 leading-relaxed">
            <li>
              • <strong>No realizamos cambios ni devoluciones.</strong>  
              Todas las prendas se hacen a pedido, por lo tanto es responsabilidad del comprador seleccionar correctamente el talle, diseño y color.
            </li>
            <li>
              • Brindamos una <strong>tabla de medidas</strong> para ayudarte a elegir el talle correcto.
            </li>
            <li>
              • Solo realizamos cambio o devolución en caso de <strong>falla notoria</strong> de la prenda, y debe informarse dentro de las <strong>24 hs</strong> posteriores a recibir el pedido.
            </li>
          </ul>
        </section>
      </div>

      {/* Animación CSS */}
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

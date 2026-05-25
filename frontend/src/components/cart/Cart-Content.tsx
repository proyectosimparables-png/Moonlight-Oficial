"use client";

import Image from "next/image"; // Importamos Image para renderizar a Jefecito 💤
import CartItem from "./Cart-Item";
import CartSummary from "./Cart-Summary";
import { ModalConfirm } from "./Modal-Confirm";

import toast from "react-hot-toast";
import { useCartActions } from "./Use-Cart-Actions";

export default function CartContent() {
  const { state, actions } = useCartActions();

  // Mostramos mensaje de carga si el carrito está vacío y se está cargando
  if (state.loading && state.cart.length === 0 && !state.initialCartLoaded) {
    return (
      <p className="p-6 text-center text-gray-500 animate-pulse">
        Cargando carrito...
      </p>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#4A4A4A] relative font-sans">
      <div className="p-4 flex-1 max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-2">
          <h2 className="text-lg font-light tracking-widest text-center flex-1 uppercase">
            Carrito de compras
          </h2>
          <button
            onClick={() => actions.router.push("/")}
            className="text-gray-400 hover:text-gray-800 text-2xl ml-4"
          >
            ×
          </button>
        </div>

        {/* ====================================================================
            ESTADO VACÍO: Con Jefecito Dormido 💤
           ==================================================================== */}
        {state.cart.length === 0 ? (
          <div className="text-center py-16 animate-in fade-in duration-500 flex flex-col items-center justify-center">
            <div className="mb-6 transition-transform hover:scale-105 duration-300">
              <Image
                src="/jefecito-dormido.png" // Apunta a public/jefecito-dormido.png
                alt="Jefecito Dormido 💤"
                width={200}
                height={200}
                priority
                className="drop-shadow-sm object-contain mx-auto"
              />
            </div>
            <p className="text-gray-400 mb-6 text-sm uppercase tracking-widest">
              Tu carrito está vacío
            </p>
            <button
              onClick={() => actions.router.push("/")}
              className="bg-[#A186ED] text-white px-8 py-3 rounded-sm text-xs font-bold uppercase tracking-widest hover:bg-[#8e74d3] transition-colors shadow-sm"
            >
              Volver a la tienda
            </button>
          </div>
        ) : (
          <>
            {/* Lista de productos en el carrito */}
            <ul className="divide-y divide-gray-100">
              {state.cart.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  processing={state.processingItems[item.id] || false}
                  increment={actions.increment}
                  decrement={actions.decrement}
                  remove={(id) => actions.setModalDeleteId(id)}
                />
              ))}
            </ul>

            {/* Resumen del carrito: subtotal, descuento, total */}
            <CartSummary
              subtotal={state.subtotal}
              descuento={state.descuento}
              totalPrice={state.totalPrice}
              items={state.cart}
              postalCode={state.postalCode}
              setPostalCode={actions.setPostalCode}
              handleCheckout={actions.handleCheckout}
              openClearCartModal={() => actions.setModalClearOpen(true)}
              // ✅ Agregamos esto para conectar el envío con el estado global
              onShippingChange={actions.setShippingInfo}
            />
          </>
        )}
      </div>

      {/* Modal de confirmación para eliminar un producto */}
      <ModalConfirm
        open={Boolean(state.modalDeleteId)}
        title="Eliminar producto"
        message="¿Seguro que deseas eliminar este producto?"
        confirmText="Eliminar"
        onConfirm={async () => {
          if (state.modalDeleteId) {
            await actions.removeItem(state.modalDeleteId);
            actions.setModalDeleteId(null);
          }
        }}
        onCancel={() => actions.setModalDeleteId(null)}
      />

      {/* Modal de confirmación para vaciar el carrito */}
      <ModalConfirm
        open={state.modalClearOpen}
        title="Vaciar carrito"
        message="¿Seguro que deseas vaciar todo el carrito?"
        confirmText="Vaciar"
        onConfirm={async () => {
          await actions.clearCart();
          toast.success("Carrito vacío");
          actions.setModalClearOpen(false);
        }}
        onCancel={() => actions.setModalClearOpen(false)}
      />
    </div>
  );
}

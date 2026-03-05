"use client";

import CartItem from "./CartItem";
import CartSummary from "./CartSummary";
import { ModalConfirm } from "./ModalConfirm";

import toast from "react-hot-toast";
import { useCartActions } from "./UseCartActions";

export default function CartContent() {
  const { state, actions } = useCartActions();

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

        {state.cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-6">
              No tienes productos en el carrito.
            </p>
            <button
              onClick={() => actions.router.push("/")}
              className="text-purple-600 font-semibold underline"
            >
              Ir a la tienda
            </button>
          </div>
        ) : (
          <>
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

            <CartSummary
              items={state.cart}
              totalPrice={state.totalPrice}
              finalTotal={state.totalPrice}
              postalCode={state.postalCode}
              setPostalCode={actions.setPostalCode}
              handleCheckout={actions.handleCheckout}
              router={actions.router}
              openClearCartModal={() => actions.setModalClearOpen(true)}
              onShippingChange={(nombre, costo, type) =>
                actions.setShippingInfo(nombre, costo, type)
              }
            />
          </>
        )}
      </div>

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

      {/* El AddedToCartModal ha sido removido de aquí */}
    </div>
  );
}

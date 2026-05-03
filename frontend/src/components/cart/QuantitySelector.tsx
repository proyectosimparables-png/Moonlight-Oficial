// frontend/src/components/cart/QuantitySelector.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast"; // ✅ Importamos toast
import { Minus, Plus } from "lucide-react"; // Opcional: para usar iconos en lugar de texto

interface QuantitySelectorProps {
  quantity: number;
  stock: number;
  onChange: (newQuantity: number) => void;
  disabled?: boolean;
}

export function QuantitySelector({
  quantity,
  stock,
  onChange,
  disabled = false,
}: QuantitySelectorProps) {
  const increment = () => {
    if (disabled) return;

    if (quantity < stock) {
      onChange(quantity + 1);
    } else {
      // ✅ Avisamos que no hay más stock
      // Usamos un 'id' fijo para que no se dupliquen los mensajes si cliquea rápido
      toast.error(`Stock máximo alcanzado (${stock} unidades)`, {
        id: "stock-limit-toast",
        icon: "📦",
      });
    }
  };

  const decrement = () => {
    if (quantity > 1 && !disabled) {
      onChange(quantity - 1);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Etiqueta opcional para mejorar la estética */}
      <label className="text-[11px] font-bold text-[#6c5b7b] uppercase tracking-wider">
        Cantidad
      </label>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={decrement}
          disabled={disabled || quantity <= 1}
          className="w-9 h-9 flex items-center justify-center rounded-xl border-[#d8c4fa] hover:bg-purple-50 text-[#7b5ca2] transition-colors"
        >
          <Minus size={16} />
        </Button>

        <span className="min-w-7.5 text-center font-bold text-[#4A4A4A] text-lg">
          {quantity}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={increment}
          // ✅ IMPORTANTE: No deshabilitamos el botón cuando llega al stock
          // para que el usuario pueda cliquear y ver el Toast de aviso.
          disabled={disabled}
          className={`w-9 h-9 flex items-center justify-center rounded-xl border-[#d8c4fa] text-[#7b5ca2] transition-colors ${
            quantity >= stock ? "opacity-60 bg-gray-50" : "hover:bg-purple-50"
          }`}
        >
          <Plus size={16} />
        </Button>
      </div>
    </div>
  );
}

// frontend/src/components/cart/QuantitySelector.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";

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
    if (quantity < stock && !disabled) {
      onChange(quantity + 1);
    }
  };

  const decrement = () => {
    if (quantity > 1 && !disabled) {
      onChange(quantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={decrement}
        disabled={disabled || quantity <= 1}
        className="w-8 h-8 flex items-center justify-center rounded-full"
      >
        -
      </Button>
      <span className="min-w-[20px] text-center">{quantity}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={increment}
        disabled={disabled || quantity >= stock}
        className="w-8 h-8 flex items-center justify-center rounded-full"
      >
        +
      </Button>
    </div>
  );
}

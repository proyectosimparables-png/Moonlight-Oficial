//frontend/src/components/cart/Cart.tsx
"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import CartContent from "./CartContent";

export default function Cart() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}

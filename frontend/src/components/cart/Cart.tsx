//frontend/src/components/cart/Cart.tsx
"use client";

import ProtectedRoute from "@/components/protected-route/ProtectedRoute";
import CartContent from "./CartContent";

export default function Cart() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}

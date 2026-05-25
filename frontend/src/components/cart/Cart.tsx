//frontend/src/components/cart/Cart.tsx
"use client";

import ProtectedRoute from "@/components/protected-route/Protected-Route";
import CartContent from "./Cart-Content";

export default function Cart() {
  return (
    <ProtectedRoute>
      <CartContent />
    </ProtectedRoute>
  );
}

"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export function useUserRole() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUserRole debe usarse dentro de AuthProvider");
  }

  const { role, isAuthenticated, authLoaded } = context;

  if (!authLoaded) {
    return { role: null, loading: true };
  }

  const finalRole = isAuthenticated ? role : "CLIENTE";

  return { role: finalRole, loading: false };
}

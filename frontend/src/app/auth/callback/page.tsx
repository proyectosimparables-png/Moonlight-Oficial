"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { isAuthenticated, role, authLoaded} = useAuth();

  useEffect(() => {
    if (!authLoaded) return;
    if (isAuthenticated && role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/");
    }
  }, [isAuthenticated, role, authLoaded, router]);
 


  return <div className="p-4">Redirigiendo...</div>;
}



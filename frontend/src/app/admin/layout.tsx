'use client';
import { useRouter } from "next/navigation";

import { useUserRole } from "@/hooks/useUserRole";
import AdminNavbar from "@/components/admin/NavbarAdmin";
import { ReactNode, useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { role, loading } = useUserRole();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!loading) {
 
      if (role !== "ADMIN") {
        router.replace("/");
      } else {
        setChecking(false);
      }
    }
  }, [role, loading, router]);

  if (checking || loading) {
    return <div className="p-4">Verificando acceso...</div>;
  }

  return (
    <div className="flex">
      <AdminNavbar />
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

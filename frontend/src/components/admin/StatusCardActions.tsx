"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";
import { adminOrderService } from "@/services/adminOrderService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function StatusActionButton({
  ordenId,
  estado,
}: {
  ordenId: string;
  estado: string;
}) {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const handleUpdate = async (nuevoEstado: string) => {
    setLoading(nuevoEstado);
    try {
      await adminOrderService.updateStatus(ordenId, nuevoEstado);
      toast.success(`Orden actualizada`);
      router.refresh();
    } catch {
      toast.error("Error al actualizar");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {estado === "PAGADO" && (
          <Button
            onClick={() => handleUpdate("EMPAQUETADO")}
            disabled={!!loading}
            className="bg-[#0061E0] hover:bg-[#0051bc] text-white font-bold px-6"
          >
            {loading === "EMPAQUETADO" && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Marcar como empaquetado
          </Button>
        )}

        {(estado === "EMPAQUETADO" || estado === "ENVIADO") && (
          <Button
            onClick={() => handleUpdate("ENVIADO")}
            disabled={!!loading || estado === "ENVIADO"}
            className="bg-[#0061E0] hover:bg-[#0051bc] text-white font-bold px-6"
          >
            {loading === "ENVIADO" && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            Notificar envío
          </Button>
        )}
      </div>

      {(estado === "EMPAQUETADO" || estado === "ENVIADO") && (
        <button
          onClick={() => handleUpdate("PAGADO")}
          disabled={!!loading}
          className="flex items-center text-[#0061E0] text-sm font-medium hover:underline gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Desempaquetar
        </button>
      )}
    </div>
  );
}

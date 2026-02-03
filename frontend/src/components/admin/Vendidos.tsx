'use client';

import { ArrowLeft, Printer, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminOrderService } from "@/services/adminOrderService";
import toast from "react-hot-toast";

interface Props {
  ordenId: string;
  estado: string;
}

export default function OrderHeader({ ordenId, estado }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handlePrepare = async () => {
    setLoading(true);
    try {
      await adminOrderService.updateStatus(ordenId, 'EMPAQUETADO');
      toast.success("Estado actualizado a Empaquetado");
      router.refresh();
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Orden #{ordenId.split('-')[0].toUpperCase()}
            </h1>
            <Badge className="bg-emerald-500 text-white border-none">{estado}</Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir
        </Button>
        <Button 
          onClick={handlePrepare} 
          disabled={loading || estado === 'EMPAQUETADO'}
          className="bg-violet-600 hover:bg-violet-700 text-white"
        >
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Package className="mr-2 h-4 w-4" />}
          Marcar como empaquetado
        </Button>
      </div>
    </div>
  );
}
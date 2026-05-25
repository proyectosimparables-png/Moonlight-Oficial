"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/componentes/ui/button";
import { Checkbox } from "@/componentes/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/componentes/ui/dialog";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    motivo: string;
    restaurarStock: boolean;
    enviarEmail: boolean;
  }) => void;
  orderId: string;
}

export function ModalCancelarVenta({
  isOpen,
  onClose,
  onConfirm,
  orderId,
}: Props) {
  const [motivo, setMotivo] = useState("El cliente cambió de idea");
  const [restaurarStock, setRestaurarStock] = useState(true);
  const [enviarEmail, setEnviarEmail] = useState(true);

  const handleConfirm = () => {
    onConfirm({ motivo, restaurarStock, enviarEmail });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-112.5 p-0 overflow-hidden border-none shadow-2xl">
        <div className="p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-2xl font-bold text-gray-800">
              Cancelar venta #{orderId.split("-")[0].toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {/* Banner de advertencia */}
          <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-3 mb-6">
            <AlertCircle className="text-orange-500 shrink-0" size={20} />
            <div className="space-y-1">
              <p className="text-sm font-bold text-orange-800">
                Tené en cuenta
              </p>
              <p className="text-xs text-orange-700 leading-relaxed">
                En caso de haber recibido el pago, deberás devolver el dinero
                desde el medio utilizado.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Select de Motivo */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 ml-1">
                ¿Por qué querés cancelarla?
              </label>
              <select
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all cursor-pointer"
              >
                <option value="El cliente cambió de idea">
                  El cliente cambió de idea
                </option>
                <option value="No hay stock de un producto">
                  No hay stock de un producto
                </option>
                <option value="Falta de pago">Falta de pago</option>
                <option value="Error en los datos de envío">
                  Error en los datos de envío
                </option>
                <option value="Otro motivo">Otro motivo</option>
              </select>
            </div>

            {/* Opciones adicionales */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="email-checkbox"
                  checked={enviarEmail}
                  onCheckedChange={(v) => setEnviarEmail(!!v)}
                />
                <label
                  htmlFor="email-checkbox"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Enviar e-mail de notificación al cliente
                </label>
              </div>
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="stock-checkbox"
                  checked={restaurarStock}
                  onCheckedChange={(v) => setRestaurarStock(!!v)}
                />
                <label
                  htmlFor="stock-checkbox"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Restaurar stock de los productos
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 flex justify-end gap-3 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-xl px-6"
          >
            Volver
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 font-semibold"
          >
            Confirmar Cancelación
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

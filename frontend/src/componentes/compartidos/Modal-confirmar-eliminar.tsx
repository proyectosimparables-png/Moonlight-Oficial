"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/componentes/ui/dialog";
import { Button } from "@/componentes/ui/button";
import React, { FC } from "react";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  title?: string;
  message?: string;
}

const ConfirmDeleteModal: FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  title = "Confirmar eliminación",
  message = "¿Estás seguro que deseas eliminar este producto? Esta acción no se puede deshacer.",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-87.5">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-(--color-purple-dark)]">
            {title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <DialogFooter className="mt-4 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="hover:bg-(--color-purple-light) transition"
          >
            Cancelar
          </Button>

          {/* Botón de eliminar único, con ancho fijo para evitar que se mueva */}
          <Button
            className="bg-red-600 hover:bg-red-700 text-white transition-all min-w-25" // min-width fijo
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDeleteModal;

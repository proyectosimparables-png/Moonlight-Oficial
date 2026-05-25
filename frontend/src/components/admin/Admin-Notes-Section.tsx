"use client";

import { useState } from "react";
import { PencilLine, Check, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { adminOrderService } from "@/services/admin/admin-orders-service";
import { useRouter } from "next/navigation";

export default function AdminNotesSection({
  orderId,
  initialNote,
}: {
  orderId: string;
  initialNote: string;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(initialNote || "");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await adminOrderService.updateAdminNotes(orderId, note);
      setIsEditing(false);
      router.refresh(); // Actualiza los datos en el servidor sin recargar la página
    } catch {
      alert("No se pudo guardar la nota");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Tus notas internas
          </h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
            >
              <PencilLine className="h-5 w-5 text-gray-600" />
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="p-2 bg-green-50 text-green-600 rounded-lg border border-green-200 hover:bg-green-100 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Check className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setNote(initialNote);
                }}
                className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <textarea
            className="w-full p-3 border rounded-lg text-sm focus:ring-2 focus:ring-[#0061E0] min-h-25 outline-none"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Escribe una nota interna..."
          />
        ) : (
          <p
            className={`text-sm ${note ? "text-gray-800" : "text-gray-400 italic"}`}
          >
            {note || "No hay notas internas todavía."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

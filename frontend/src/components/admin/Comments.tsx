"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Search } from "lucide-react";
import { getComentarios, deleteComentario } from "@/services/comments-service";
import ConfirmDeleteModal from "../shared/Confirm-Delete-Modal";
import toast from "react-hot-toast";
import React from "react";

interface ComentarioType {
  id: string;
  contenido: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    image?: string;
  };
}

const ComentariosAdmin = () => {
  const [comentarios, setComentarios] = useState<ComentarioType[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [comentarioAEliminar, setComentarioAEliminar] = useState<string | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para obtener la URL del avatar
  const getAvatarUrl = (user: ComentarioType["user"]) => {
    if (user.image) return user.image;

    // Si no hay imagen, usamos UI Avatars con el nombre (o el email como fallback)
    const seed = user.name || user.email || "Usuario";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      seed,
    )}&background=8b5cf6&color=fff&size=128`;
  };

  const abrirModalEliminar = (id: string) => {
    setComentarioAEliminar(id);
    setModalOpen(true);
  };

  const fetchComentarios = async () => {
    try {
      // ⚡ SOLUCIÓN TS: Le pasamos el tipo genérico explícito al servicio unificado
      const data = await getComentarios<ComentarioType[]>();
      setComentarios(data || []);
    } catch (error) {
      console.error("Error fetching comentarios:", error);
      toast.error("❌ No se pudieron cargar los comentarios");
    }
  };

  useEffect(() => {
    fetchComentarios();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!comentarioAEliminar) return;
    setIsDeleting(true);

    try {
      await deleteComentario(comentarioAEliminar);
      setComentarios((prev) =>
        prev.filter((c) => c.id !== comentarioAEliminar),
      );
      toast.success("✅ Comentario eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar comentario:", error);
      toast.error("❌ No se pudo eliminar el comentario");
    } finally {
      setIsDeleting(false);
      setModalOpen(false);
      setComentarioAEliminar(null);
    }
  };

  const filteredComentarios = comentarios.filter(
    (c) =>
      c.contenido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.user?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.user?.email || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="space-y-6 w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comentarios</h1>
            <p className="text-muted-foreground">
              Gestiona los comentarios de los usuarios
            </p>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar comentarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                {/* ⚡ SOLUCIÓN TW: Cambiamos min-w-[300px] por min-w-75 */}
                <TableHead className="min-w-75">Comentario</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredComentarios.length > 0 ? (
                filteredComentarios.map((c) => (
                  <TableRow
                    key={c.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 shrink-0">
                          <Image
                            src={getAvatarUrl(c.user)}
                            alt={c.user?.name || "Usuario"}
                            fill
                            className="rounded-full object-cover border border-border"
                          />
                        </div>
                        <span className="font-medium">
                          {c.user?.name || "Sin nombre"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.user?.email}
                    </TableCell>
                    <TableCell className="max-w-md italic text-foreground/80">
                      {/* ⚡ SOLUCIÓN ESLINT: Escapamos las comillas usando &quot; */}
                      &quot;{c.contenido}&quot;
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {new Date(c.createdAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:text-destructive transition-colors"
                        onClick={() => abrirModalEliminar(c.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No se encontraron comentarios.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
        message="¿Estás seguro que deseas eliminar este comentario? Esta acción no se puede deshacer."
      />
    </div>
  );
};

export default ComentariosAdmin;

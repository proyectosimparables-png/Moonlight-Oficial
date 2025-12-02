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
import { Trash2 } from "lucide-react";
import { getComentarios, deleteComentario } from "@/services/comentarios";
import ConfirmDeleteModal from "../ConfirmDeleteModal";
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
  const [comentarioAEliminar, setComentarioAEliminar] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const abrirModalEliminar = (id: string) => {
    setComentarioAEliminar(id);
    setModalOpen(true);
  };

  const fetchComentarios = async () => {
    try {
      const data = await getComentarios(); // Devuelve todos los comentarios
      setComentarios(data);
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
      setComentarios((prev) => prev.filter((c) => c.id !== comentarioAEliminar));
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
      c.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex justify-center px-4">
      <div className="space-y-6 w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comentarios</h1>
            <p className="text-muted-foreground">Gestiona los comentarios de los usuarios</p>
          </div>
          <div className="relative flex-1 max-w-sm">
            <Input
              placeholder="Buscar comentarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Avatar</TableHead>
                <TableHead>Comentario</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredComentarios.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.user.name}</TableCell>
                  <TableCell>{c.user.email}</TableCell>
                  <TableCell>
                    <Image
                      src={c.user.image || "/default-avatar.png"}
                      alt={c.user.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  </TableCell>
                  <TableCell>{c.contenido}</TableCell>
                  <TableCell>
                    {new Date(c.createdAt).toLocaleString("es-ES")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => abrirModalEliminar(c.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </div>
  );
};

export default ComentariosAdmin;

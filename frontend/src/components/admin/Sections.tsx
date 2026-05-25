"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { getSecciones, getAllCategorias } from "@/services/products-service";
import {
  actualizarSeccion,
  crearSeccion,
  eliminarSeccion,
} from "@/services/admin/admin-products-actions";

type Categoria = {
  id: string;
  nombre: string;
  seccionId?: string; // Añadido opcional por si tus categorías están vinculadas a una sección
};

// 🔹 Ajustado perfectamente a lo que devuelve tu backend real (SeccionType)
type SeccionBase = {
  id: string;
  nombre: string;
  productoCount?: number;
};

type SeccionConCategorias = {
  id: string;
  nombre: string;
  productoCount: number;
  categorias: Categoria[];
};

const Secciones = () => {
  const [secciones, setSecciones] = useState<SeccionConCategorias[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [seccionEditando, setSeccionEditando] =
    useState<SeccionConCategorias | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");

  const [nuevaSeccionNombre, setNuevaSeccionNombre] = useState("");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [seccionAEliminar, setSeccionAEliminar] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 🔹 Cargar secciones junto con sus categorías correspondientes
  useEffect(() => {
    const cargarSeccionesConCategorias = async () => {
      try {
        setLoading(true);

        // 1. Traemos las secciones crudas del back
        const seccionesData: SeccionBase[] = await getSecciones();

        // 2. Traemos TODAS las categorías (ya que getAllCategorias() no acepta ID por parámetro)
        let todasLasCategorias: Categoria[] = [];
        try {
          todasLasCategorias = await getAllCategorias();
        } catch (catErr) {
          console.error("Error al traer categorías globales:", catErr);
        }

        // 3. Armamos el estado vinculando cada sección con sus categorías mapeadas
        const seccionesConCategorias: SeccionConCategorias[] =
          seccionesData.map((sec) => {
            // Si tus categorías tienen 'seccionId', las filtramos. Si no, dejamos el array vacío o manejamos el fallback.
            const categoriasDeEstaSeccion = todasLasCategorias.filter(
              (cat) => cat.seccionId === sec.id,
            );

            return {
              id: sec.id,
              nombre: sec.nombre,
              productoCount: sec.productoCount ?? 0,
              categorias: categoriasDeEstaSeccion,
            };
          });

        setSecciones(seccionesConCategorias);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Error cargando secciones y categorías");
      } finally {
        setLoading(false);
      }
    };

    cargarSeccionesConCategorias();
  }, []);

  if (loading) return <p className="text-center mt-8">Cargando secciones...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;

  const handleEliminarSeccion = async (id: string) => {
    try {
      await eliminarSeccion(id);
      setSecciones((prev) => prev.filter((sec) => sec.id !== id));
      toast.success("Sección eliminada");
    } catch (error) {
      console.error("Error al eliminar sección:", error);
      toast.error("No se pudo eliminar la sección.");
    }
  };

  const abrirModalEdicion = (seccion: SeccionConCategorias) => {
    setSeccionEditando(seccion);
    setNuevoNombre(seccion.nombre);
    setIsEditModalOpen(true);
  };

  const guardarEdicion = async () => {
    if (!seccionEditando) return;
    setIsUpdating(true);

    try {
      const seccionActualizada: SeccionBase = await actualizarSeccion(
        seccionEditando.id,
        {
          nombre: nuevoNombre,
        },
      );

      setSecciones((prev) =>
        prev.map((sec) =>
          sec.id === seccionActualizada.id
            ? {
                ...sec,
                nombre: seccionActualizada.nombre,
                categorias: sec.categorias,
              }
            : sec,
        ),
      );

      toast.success("Sección actualizada");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar sección:", error);
      toast.error("No se pudo actualizar la sección.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCrearSeccion = async () => {
    if (!nuevaSeccionNombre.trim()) {
      toast.error("El nombre de la sección es obligatorio");
      return;
    }

    try {
      const nueva: SeccionBase = await crearSeccion({
        nombre: nuevaSeccionNombre,
      });

      setSecciones((prev) => [
        ...prev,
        {
          id: nueva.id,
          nombre: nueva.nombre,
          productoCount: 0,
          categorias: [],
        },
      ]);
      toast.success("Sección creada correctamente");

      setNuevaSeccionNombre("");
      setIsNewModalOpen(false);
    } catch (error) {
      console.error("Error al crear sección:", error);
      toast.error("No se pudo crear la sección.");
    }
  };

  return (
    <div className="space-y-6 px-4">
      {/* 🔹 Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-(--text-heading)">
            Secciones
          </h1>
          <p className="text-(--color-dark-gray)">
            Organiza tus productos por secciones
          </p>
        </div>
        <Button
          className="bg-(--color-dark) hover:bg-(--color-lilac) text-white transition-all"
          onClick={() => setIsNewModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nueva Sección
        </Button>
      </div>

      {/* 🔹 Listado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {secciones.map((seccion) => (
          <Card
            key={seccion.id}
            className="relative hover:shadow-lg transition-all border min-w-55"
          >
            <CardHeader>
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  style={{
                    backgroundColor: "var(--color-dark)",
                    color: "white",
                  }}
                  onClick={() => abrirModalEdicion(seccion)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  style={{ backgroundColor: "#e74c3c", color: "white" }}
                  onClick={() => {
                    setSeccionAEliminar(seccion.id);
                    setIsConfirmModalOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center"
                  style={{ background: "var(--color-cream)" }}
                >
                  <FolderTree
                    className="h-5 w-5"
                    style={{ color: "var(--color-purple)" }}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg text-(--text-heading) wrap-break-word">
                    {seccion.nombre}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-(--color-dark-gray)">
                    Productos
                  </span>
                  <Badge variant="secondary">{seccion.productoCount}</Badge>
                </div>

                {/* 🔹 Categorías */}
                <div>
                  <p className="text-sm font-medium mb-2 text-(--text-heading)">
                    Categorías:
                  </p>
                  {seccion.categorias && seccion.categorias.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {seccion.categorias.map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="outline"
                          className="text-xs text-(--text-heading) border-(--color-purple)"
                        >
                          {cat.nombre}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 italic">
                      Sin categorías
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🗑️ MODAL CONFIRMAR ELIMINACIÓN */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-100">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600">
              Confirmar eliminación
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar esta sección? Esta acción no se
            puede deshacer.
          </p>
          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              className="hover:bg-gray-100 transition"
            >
              Cancelar
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white transition-all"
              onClick={async () => {
                if (seccionAEliminar)
                  await handleEliminarSeccion(seccionAEliminar);
                setIsConfirmModalOpen(false);
                setSeccionAEliminar(null);
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🟣 MODAL CREAR NUEVA SECCIÓN */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Nueva Sección
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre de la sección
              </Label>
              <Input
                id="nombre"
                value={nuevaSeccionNombre}
                onChange={(e) => setNuevaSeccionNombre(e.target.value)}
                placeholder="Ej. Indumentaria"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsNewModalOpen(false)}
              className="hover:bg-gray-100 transition"
            >
              Cancelar
            </Button>
            <Button
              className="bg-(--color-dark) hover:bg-(--color-lilac) text-white transition-all"
              onClick={handleCrearSeccion}
            >
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🟣 MODAL EDITAR SECCIÓN */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Sección</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nuevo nombre</Label>
              <Input
                id="nombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              className="hover:bg-gray-100 transition"
            >
              Cancelar
            </Button>
            <Button
              className="bg-(--color-dark) hover:bg-(--color-lilac) text-white transition-all"
              onClick={guardarEdicion}
              disabled={isUpdating}
            >
              {isUpdating ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Secciones;

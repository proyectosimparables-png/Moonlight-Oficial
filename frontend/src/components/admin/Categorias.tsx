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

import {
  eliminarCategoria,
  actualizarCategoria,
  getCategoriasBySeccion,
  crearCategoria,
} from "@/services/productos";

type Subcategoria = {
  id: string;
  nombre: string;
};

type CategoriaConProductos = {
  id: string;
  nombre: string;
  seccion: {
    id: string;
    nombre: string;
  };
  productoCount: number;
  subcategorias: Subcategoria[];
};

const Categorias = () => {
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [categoriaEditando, setCategoriaEditando] =
    useState<CategoriaConProductos | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");

  const [nuevaCategoriaNombre, setNuevaCategoriaNombre] = useState("");
  const [nuevaCategoriaSeccionNombre, setNuevaCategoriaSeccionNombre] =
    useState("");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<string | null>(
    null,
  );
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCategoriasBySeccion()
      .then((data) => {
        setCategorias(data);
        setError(null);
      })
      .catch(() => setError("Error cargando categorías"))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="text-center mt-8">Cargando categorías...</p>;
  if (error) return <p className="text-center mt-8 text-red-600">{error}</p>;

  const handleEliminarCategoria = async (id: string) => {
    try {
      await eliminarCategoria(id);
      setCategorias((prev) => prev.filter((cat) => cat.id !== id));
      toast.success("Categoría eliminada");
    } catch (error) {
      console.error("Error al eliminar categoría:", error);
      toast.error("No se pudo eliminar la categoría.");
    }
  };

  const abrirModalEdicion = (categoria: CategoriaConProductos) => {
    setCategoriaEditando(categoria);
    setNuevoNombre(categoria.nombre);
    setIsEditModalOpen(true);
  };

  const guardarEdicion = async () => {
    if (!categoriaEditando) return;
    setIsUpdating(true);

    try {
      const categoriaActualizada = await actualizarCategoria(
        categoriaEditando.id,
        {
          nombre: nuevoNombre,
        },
      );

      setCategorias((prev) =>
        prev.map((cat) =>
          cat.id === categoriaActualizada.id ? categoriaActualizada : cat,
        ),
      );

      toast.success("Categoría actualizada");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      toast.error("No se pudo actualizar la categoría.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCrearCategoria = async () => {
    if (!nuevaCategoriaNombre.trim()) {
      toast.error("El nombre de la categoría es obligatorio");
      return;
    }

    if (!nuevaCategoriaSeccionNombre.trim()) {
      toast.error("El nombre de la sección es obligatorio");
      return;
    }

    try {
      const nueva = await crearCategoria({
        nombre: nuevaCategoriaNombre,
        seccionNombre: nuevaCategoriaSeccionNombre,
      });

      setCategorias((prev) => [...prev, nueva]);
      toast.success("Categoría creada correctamente");

      setNuevaCategoriaNombre("");
      setNuevaCategoriaSeccionNombre("");
      setIsNewModalOpen(false);
    } catch (error) {
      console.error("Error al crear categoría:", error);
      toast.error("No se pudo crear la categoría.");
    }
  };

  return (
    <div className="space-y-6 px-4">
      {/* 🔹 Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">
            Categorías
          </h1>
          <p className="text-[var(--color-dark-gray)]">
            Organiza tus productos por categorías
          </p>
        </div>
        <Button
          className="bg-[var(--color-dark)] hover:bg-[var(--color-lilac)] text-white transition-all"
          onClick={() => setIsNewModalOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      {/* 🔹 Listado */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categorias.map((categoria) => (
          <Card
            key={categoria.id}
            className="relative hover:shadow-lg transition-all border min-w-[220px]"
          >
            <CardHeader>
              {/* Botones fijos arriba */}
              <div className="absolute top-2 right-2 flex gap-2 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  style={{
                    backgroundColor: "var(--color-dark)",
                    color: "white",
                  }}
                  onClick={() => abrirModalEdicion(categoria)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  style={{ backgroundColor: "#e74c3c", color: "white" }}
                  onClick={() => {
                    setCategoriaAEliminar(categoria.id);
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
                  <CardTitle className="text-lg text-[var(--text-heading)] break-words">
                    {categoria.nombre}
                  </CardTitle>
                  <p className="text-sm text-[var(--color-dark-gray)]">
                    {categoria.seccion?.nombre ?? "Sin sección"}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-dark-gray)]">
                    Productos
                  </span>
                  <Badge variant="secondary">{categoria.productoCount}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 text-[var(--text-heading)]">
                    Subcategorías:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {(categoria.subcategorias?.length ?? 0) > 0 ? (
                      categoria.subcategorias.map((sub) => (
                        <Badge
                          key={sub.id}
                          variant="outline"
                          className="text-xs text-[var(--text-heading)] border-[var(--color-purple)]"
                        >
                          {sub.nombre}
                        </Badge>
                      ))
                    ) : (
                      <p className="italic text-sm text-muted-foreground">
                        Sin subcategorías
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🗑️ MODAL CONFIRMAR ELIMINACIÓN */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-red-600">
              Confirmar eliminación
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar esta categoría? Esta acción no
            se puede deshacer.
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
                if (categoriaAEliminar) {
                  await handleEliminarCategoria(categoriaAEliminar);
                }
                setIsConfirmModalOpen(false);
                setCategoriaAEliminar(null);
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🟣 MODAL CREAR NUEVA CATEGORÍA */}
      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Nueva Categoría
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-2">
            <div className="space-y-2">
              <Label htmlFor="nombre" className="text-sm font-medium">
                Nombre de la categoría
              </Label>
              <Input
                id="nombre"
                value={nuevaCategoriaNombre}
                onChange={(e) => setNuevaCategoriaNombre(e.target.value)}
                placeholder="Ej. Camisas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="seccion" className="text-sm font-medium">
                Nombre de la sección
              </Label>
              <Input
                id="seccion"
                value={nuevaCategoriaSeccionNombre}
                onChange={(e) => setNuevaCategoriaSeccionNombre(e.target.value)}
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
              className="bg-[var(--color-dark)] hover:bg-[var(--color-lilac)] text-white transition-all"
              onClick={handleCrearCategoria}
            >
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🟣 MODAL EDITAR CATEGORÍA */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoría</DialogTitle>
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
              className="bg-[var(--color-dark)] hover:bg-[var(--color-lilac)] text-white transition-all"
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

export default Categorias;

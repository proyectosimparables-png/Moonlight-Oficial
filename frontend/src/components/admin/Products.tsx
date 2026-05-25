"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Search, Edit, Trash2, Loader2 } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";

import { ProductoBackend, CategoriaType } from "@/types/products";
import EditarProductoForm from "./EditarProductoForm";
import ConfirmDeleteModal from "../shared/Confirm-Delete-Modal";
import {
  deleteProducto,
  getProductosAdmin,
} from "@/services/admin/admin-products-actions";

// Definimos una interfaz limpia para el mapeo seguro de secciones en la UI
interface SeccionRelacion {
  seccion?: {
    id: string;
    nombre: string;
  };
}

const Productos = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [productoEditandoId, setProductoEditandoId] = useState<string | null>(
    null,
  );
  const [modalDescripcionOpen, setModalDescripcionOpen] = useState(false);
  const [descripcionModal, setDescripcionModal] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<number | null>(
    null,
  );

  // 🔄 ✅ SOLUCIÓN ERROR 2769: Envolvemos en una función flecha limpia para aislar el contexto de React Query
  const {
    data: productos = [],
    isLoading,
    isError,
  } = useQuery<ProductoBackend[]>({
    queryKey: ["productos-admin"],
    queryFn: () => getProductosAdmin(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProducto(id.toString()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["productos-admin"] });
      toast.success("✅ Producto eliminado correctamente");
    },
    onError: (error) => {
      console.error("Error al eliminar producto:", error);
      toast.error("❌ No se pudo eliminar el producto");
    },
    onSettled: () => {
      setModalOpen(false);
      setProductoAEliminar(null);
    },
  });

  const abrirModalEliminar = (id: number) => {
    setProductoAEliminar(id);
    setModalOpen(true);
  };

  const abrirModalDescripcion = (descripcion: string) => {
    setDescripcionModal(descripcion);
    setModalDescripcionOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productoAEliminar === null) return;
    deleteMutation.mutate(productoAEliminar);
  };

  // 🔍 ✅ SOLUCIÓN ERROR 2339: Al estar bien tipado el useQuery, .filter vuelve a funcionar con normalidad
  const filteredProductos = productos.filter(
    (producto: ProductoBackend) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function getCategoriaPath(categoria?: CategoriaType | null): string {
    if (!categoria) return "Sin categoría";
    const path: string[] = [];
    let current: CategoriaType | null | undefined = categoria;

    while (current) {
      path.unshift(current.nombre);
      current = current.parent;
    }
    return path.join(" > ");
  }

  const formatPrecio = (precio: unknown) => {
    if (precio === null || precio === undefined) return "$0";

    const clean =
      typeof precio === "string"
        ? precio.replace(/[^\d.,-]/g, "").replace(",", ".")
        : precio;

    const num = Number(clean);
    if (isNaN(num)) return "$0";

    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-[#5a2d82]" />
        <p className="text-sm font-medium text-muted-foreground">
          Cargando catálogo de administración...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-red-500 font-medium">
        Error al conectar con el endpoint de administración.
      </div>
    );
  }

  return (
    <div className="flex justify-center px-4">
      <div className="space-y-6 w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Productos (Admin)
            </h1>
            <p className="text-muted-foreground">
              Gestiona el inventario completo
            </p>
          </div>
          <Button
            className="gap-2 bg-[#5a2d82] hover:bg-[#451e5c] text-white transition-all"
            onClick={() => router.push("/admin/nuevo-producto")}
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        <div className="flex items-center gap-4 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-60">Nombre</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Secciones</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProductos.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron productos.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProductos.map((producto: ProductoBackend) => {
                  // 📦 NUEVA LÓGICA DE STOCK INTELEGENTE (MANEJA STOCK NULL === INFINITO)
                  const tieneVariantes =
                    producto.variantes && producto.variantes.length > 0;
                  const esIlimitado =
                    tieneVariantes &&
                    producto.variantes.some((v) => v.stock === null);
                  const stockSumado =
                    tieneVariantes && !esIlimitado
                      ? producto.variantes.reduce(
                          (acc, v) => acc + (v.stock ?? 0),
                          0,
                        )
                      : 0;

                  return (
                    <React.Fragment key={producto.id}>
                      <TableRow>
                        <TableCell>
                          <div className="flex flex-col gap-1 max-w-60">
                            <p className="font-medium">{producto.nombre}</p>
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-indigo-600 hover:underline max-w-max"
                              onClick={() =>
                                abrirModalDescripcion(producto.descripcion)
                              }
                            >
                              Ver descripción
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell>
                          {producto.imagenUrl ? (
                            <Image
                              src={producto.imagenUrl}
                              alt={producto.nombre}
                              width={64}
                              height={64}
                              className="object-cover rounded"
                            />
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              Sin imagen
                            </span>
                          )}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-wrap gap-1">
                              {Array.isArray(producto.secciones) &&
                              producto.secciones.length > 0 ? (
                                producto.secciones.map(
                                  (item: unknown, index: number) => {
                                    const relacion = item as SeccionRelacion;
                                    return (
                                      <Badge key={index} variant="secondary">
                                        {relacion?.seccion?.nombre || "Sección"}
                                      </Badge>
                                    );
                                  },
                                )
                              ) : (
                                // Un fallback invisible o un texto tenue por si estás en entorno de desarrollo con datos de prueba viejos
                                <span className="text-xs text-muted-foreground italic">
                                  Cargando sección...
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground mt-1">
                              {getCategoriaPath(producto.categoria)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="font-medium">
                          {formatPrecio(producto.precio)}
                        </TableCell>

                        {/* 📊 CELDA DE STOCK ACTUALIZADA */}
                        <TableCell>
                          {!tieneVariantes ? (
                            <Badge variant="secondary">Sin variantes</Badge>
                          ) : esIlimitado ? (
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-bold">
                              Ilimitado (∞)
                            </Badge>
                          ) : (
                            <Badge
                              variant={
                                stockSumado > 10 ? "outline" : "destructive"
                              }
                            >
                              {stockSumado} unidades
                            </Badge>
                          )}
                        </TableCell>

                        {/* 🟢 CELDA DE ESTADO (Faltaba) */}
                        <TableCell>
                          <Badge
                            variant={
                              producto.published ? "default" : "secondary"
                            }
                          >
                            {producto.published ? "Publicado" : "Borrador"}
                          </Badge>
                        </TableCell>

                        {/* ⚙️ CELDA DE ACCIONES (Faltaba) */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setProductoEditandoId(producto.id.toString())
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => abrirModalEliminar(producto.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* 🛠️ FORMULARIO DESPLEGABLE DE EDICIÓN EN LÍNEA (Faltaba) */}
                      {productoEditandoId === producto.id.toString() && (
                        <TableRow>
                          <TableCell colSpan={7}>
                            <EditarProductoForm
                              producto={{
                                id: producto.id,
                                nombre: producto.nombre,
                                descripcion: producto.descripcion,
                                precio: producto.precio,
                                published: producto.published,
                                imagenUrl: producto.imagenUrl ?? undefined,
                                imagenes:
                                  producto.imagenes?.map((img) => img.url) ||
                                  [],
                                colores:
                                  producto.variantes?.map((v) => v.color) || [],
                                talles:
                                  producto.variantes?.map((v) => v.talle) || [],
                                categoria: producto.categoria
                                  ? {
                                      id: producto.categoria.id,
                                      nombre: producto.categoria.nombre,
                                    }
                                  : { id: "", nombre: "Sin categoría" },
                                variantes: producto.variantes || [],
                              }}
                              onCancel={() => setProductoEditandoId(null)}
                              onUpdate={() => {
                                setProductoEditandoId(null);
                                queryClient.invalidateQueries({
                                  queryKey: ["productos-admin"],
                                });
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={deleteMutation.isPending}
      />

      {modalDescripcionOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          onClick={() => setModalDescripcionOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative overflow-auto"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-[#7b5ca2]">
              Descripción del producto
            </h2>
            <div
              className="wrap-break-word text-gray-800 leading-relaxed
                        [&>ul]:list-disc [&>ul]:ml-5 [&>ol]:list-decimal [&>ol]:ml-5"
              dangerouslySetInnerHTML={{ __html: descripcionModal }}
            />
            <Button
              className="mt-6 bg-[#7b5ca2] hover:bg-[#654a91] text-white"
              onClick={() => setModalDescripcionOpen(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Productos;

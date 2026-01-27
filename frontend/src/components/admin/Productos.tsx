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
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { deleteProducto, getProductos } from "@/services/productos";
import EditarProductoForm from "./EditarProductoForm";
import { useRouter } from "next/navigation";
import React from "react";
import toast from "react-hot-toast";
import ConfirmDeleteModal from "../ConfirmDeleteModal";

export type SeccionType = {
  id: string;
  nombre: string;
};

type CategoriaType = {
  id: string;
  nombre: string;
  parent?: CategoriaType | null;
};

type ProductoType = {
  imagenUrl: string | null;
  id: number;
  nombre: string;
  colores: string[];
  talles: string[];
  cortes: string[];
  descripcion: string;
  secciones: {
    seccion: SeccionType;
  }[];
  categoria?: CategoriaType | null;
  precio: number;
  stock: number;
  published: boolean;
};


const Productos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [productos, setProductos] = useState<ProductoType[]>([]);
  const [productoEditandoId, setProductoEditandoId] = useState<string | null>(null);
  const [modalDescripcionOpen, setModalDescripcionOpen] = useState(false);
  const [descripcionModal, setDescripcionModal] = useState<string>("");
  const router = useRouter();

  const [modalOpen, setModalOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const abrirModalEliminar = (id: number) => {
    setProductoAEliminar(id);
    setModalOpen(true);
  };

  const abrirModalDescripcion = (descripcion: string) => {
    setDescripcionModal(descripcion);
    setModalDescripcionOpen(true);
  };

  const fetchProductos = async () => {
    try {
      const data = await getProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error fetching productos:", error);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const handleDeleteConfirm = async () => {
    if (productoAEliminar === null) return;
    setIsDeleting(true);

    try {
      await deleteProducto(productoAEliminar.toString());
      setProductos((prev) => prev.filter((p) => p.id !== productoAEliminar));
      toast.success("✅ Producto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      toast.error("❌ No se pudo eliminar el producto");
    } finally {
      setIsDeleting(false);
      setModalOpen(false);
      setProductoAEliminar(null);
    }
  };

  const filteredProductos = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      producto.secciones?.some((ps) => ps.seccion.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
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

    // Limpiamos el valor en caso de que venga como string con símbolos
    let clean = typeof precio === "string"
      ? precio.replace(/[^\d.,-]/g, "").replace(",", ".")
      : precio;

    const num = Number(clean);

    if (isNaN(num)) return "$0";

    // Usamos Intl.NumberFormat para que ponga los puntos de miles correctamente
    // y no ponga decimales a menos que realmente los tenga.
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0, // Si es entero, no muestra decimales
      maximumFractionDigits: 2, // Si tiene centavos, muestra hasta 2
    }).format(num);
  };

  return (
    <div className="flex justify-center px-4">
      <div className="space-y-6 w-full max-w-7xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">Gestiona el catálogo de tu tienda</p>
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
                <TableHead className="min-w-[250px]">Nombre</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Sección</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredProductos.map((producto) => (
                <React.Fragment key={producto.id}>
                  <TableRow>
                    <TableCell>
                      <div className="flex flex-col gap-1 max-w-[250px]">
                        <p className="font-medium">{producto.nombre}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 text-indigo-600 hover:underline max-w-max"
                          onClick={() => abrirModalDescripcion(producto.descripcion)}
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
                        "Sin imagen"
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {/* Sección */}
                        <Badge variant="secondary" className="w-fit">
                          {producto.secciones?.length ? (
                            producto.secciones.map((ps: any) => {
                              // Si ps es un string (porque ya pasó por el formateador del service)
                              if (typeof ps === "string") {
                                return <Badge key={ps} variant="secondary">{ps}</Badge>;
                              }

                              // Si ps es un objeto (estructura de Prisma), protegemos el acceso a .seccion
                              return (
                                <Badge key={ps.seccion?.id || Math.random()} variant="secondary">
                                  {ps.seccion?.nombre || "Cargando..."}
                                </Badge>
                              );
                            })
                          ) : (
                            <Badge variant="secondary">Sin sección</Badge>
                          )}
                        </Badge>

                        {/* Categoría jerárquica */}
                        <span className="text-sm text-muted-foreground">
                          {getCategoriaPath(producto.categoria)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatPrecio(producto.precio)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={producto.stock > 50 ? "default" : "destructive"}
                      >
                        {producto.stock} unidades
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={producto.published ? "default" : "secondary"}
                      >
                        {producto.published ? "Publicado" : "Borrador"}
                      </Badge>
                    </TableCell>

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

                  {productoEditandoId === producto.id.toString() && (
                    <TableRow>
                      <TableCell colSpan={7}>
                        <EditarProductoForm
                          producto={{
                            id: producto.id,
                            nombre: producto.nombre,
                            descripcion: producto.descripcion,
                            precio: producto.precio,
                            stock: producto.stock,
                            published: producto.published,
                            imagenUrl: producto.imagenUrl ?? undefined,
                            colores: producto.colores || [],
                            talles: producto.talles || [],
                            cortes: producto.cortes || [],
                            // Solución al error de tipos:
                            categoria: producto.secciones?.[0]?.seccion
                              ? {
                                id: producto.secciones[0].seccion.id,
                                nombre: producto.secciones[0].seccion.nombre,
                              }
                              : { id: "", nombre: "Sin categoría" }, // Valor por defecto para que no sea undefined
                          }}
                          onCancel={() => setProductoEditandoId(null)}
                          onUpdate={() => {
                            setProductoEditandoId(null);
                            fetchProductos();
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Modal de confirmación para eliminar */}
      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />

      {/* Modal para mostrar descripción */}
      {modalDescripcionOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
          onClick={() => setModalDescripcionOpen(false)}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative overflow-auto"
            style={{ maxHeight: "80vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4 text-[#7b5ca2]">Descripción del producto</h2>

            {/* CAMBIO AQUÍ: Renderizado de HTML con estilos para listas */}
            <div
              className="break-words text-gray-800 leading-relaxed
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

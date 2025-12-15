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

type ProductoType = {
  imagenUrl: string | null;
  id: number;
  nombre: string;
  descripcion: string;
  seccion: {
    id: number;
    nombre: string;
  };
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

  const formatPrecio = (precio: unknown) => {
    if (precio === null || precio === undefined) return "$0.00";

    let clean = typeof precio === "string"
      ? precio.replace(/[^\d.,-]/g, "").replace(",", ".")
      : precio;

    const num = Number(clean);
    return isNaN(num) ? "$0.00" : `$${num.toFixed(2)}`;
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
      producto.seccion?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                      {producto.seccion?.nombre ?? "Sin sección"}
                    </TableCell>

                    <TableCell>{formatPrecio(producto.precio)}</TableCell>

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
                            categoria: {
                              id: producto.seccion.id,
                              nombre: producto.seccion.nombre,
                            },
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
            style={{ maxHeight: "80vh", wordWrap: "break-word" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold mb-4">Descripción del producto</h2>
            <p className="whitespace-pre-wrap break-words">{descripcionModal}</p>
            <Button
              className="mt-6"
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

'use client';

import { useEffect, useState } from "react";
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
import EditarProductoForm from './EditarProductoForm';
import { useRouter } from "next/navigation";

const Productos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [productos, setProductos] = useState<Array<{
    imagenUrl: string | null;
    id: number;
    nombre: string;
    descripcion: string;
    categoria: {
      id: number;
      nombre: string;
    };
    categoriaId: string;
    tipoPrendaId: string;
    precio: number;
    stock: number;
    published: boolean;
  }>>([]);

  const [productoEditandoId, setProductoEditandoId] = useState<string | null>(null);
  const router = useRouter();

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

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro que deseas eliminar este producto?")) return;

    try {
      await deleteProducto(id.toString());
      setProductos((prev) => prev.filter((p) => p.id !== id));
      alert("✅ Producto eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      alert("❌ No se pudo eliminar el producto");
    }
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    producto.categoria?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex justify-center px-4">
      <div className="space-y-6 w-full max-w-7xl"> {/* ⬅️ ancho máximo centrado */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">Gestiona el catálogo de tu tienda</p>
          </div>
          <Button className="gap-2" onClick={() => router.push("/admin/nuevo-producto")}>
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Imagen</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.map((producto) => (
                <>
                  <TableRow key={producto.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{producto.nombre}</p>
                        <p className="text-sm text-muted-foreground">{producto.descripcion}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {producto.imagenUrl ? (
                        <img
                          src={producto.imagenUrl}
                          alt={producto.nombre}
                          className="h-16 w-16 object-cover rounded"
                        />
                      ) : (
                        "Sin imagen"
                      )}
                    </TableCell>
                    <TableCell>{producto.categoria?.nombre ?? "Sin categoría"}</TableCell>
                    <TableCell>${producto.precio.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={producto.stock > 50 ? "default" : "destructive"}>
                        {producto.stock} unidades
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={producto.published ? "default" : "secondary"}>
                        {producto.published ? "Publicado" : "Borrador"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setProductoEditandoId(producto.id.toString())}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(producto.id)}
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
                          producto={producto}
                          onCancel={() => setProductoEditandoId(null)}
                          onUpdate={() => {
                            setProductoEditandoId(null);
                            fetchProductos();
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Productos;

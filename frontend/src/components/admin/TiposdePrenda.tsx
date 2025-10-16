'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Shirt } from "lucide-react";
import {
  getTiposPrenda,
  eliminarTipoPrenda,
  actualizarTipoPrenda,
} from "@/services/productos";
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

// Tipos
type Categoria = {
  id: string;
  nombre: string;
};

type TipoPrenda = {
  id: string;
  nombre: string;
  categorias?: Categoria[];
  productoCount?: number;
};

const TiposPrenda = () => {
  const [tiposPrenda, setTiposPrenda] = useState<TipoPrenda[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoPrenda | null>(null);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Obtener tipos de prenda
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTiposPrenda();
        setTiposPrenda(data);
      } catch (error) {
        console.error("Error al cargar tipos de prenda:", error);
        setError("No se pudieron cargar los tipos de prenda.");
      }
    };

    fetchData();
  }, []);

  const abrirModalEdicion = (tipo: TipoPrenda) => {
    setTipoSeleccionado(tipo);
    setNuevoNombre(tipo.nombre);
    setIsEditModalOpen(true);
  };

  const guardarEdicion = async () => {
    if (!tipoSeleccionado) return;

    try {
      const actualizado = await actualizarTipoPrenda(tipoSeleccionado.id, {
        nombre: nuevoNombre,
      });

      setTiposPrenda(prev =>
        prev.map(tipo =>
          tipo.id === actualizado.id ? { ...tipo, nombre: actualizado.nombre } : tipo
        )
      );

      toast.success("Tipo de prenda actualizado");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error actualizando tipo de prenda", error);
      toast.error("No se pudo actualizar el tipo de prenda.");
    }
  };

  const handleEliminar = async (id: string) => {
    const confirmado = confirm("¿Seguro que querés eliminar este tipo de prenda?");
    if (!confirmado) return;

    try {
      await eliminarTipoPrenda(id);
      setTiposPrenda(prev => prev.filter((tipo) => tipo.id !== id));
      toast.success("Tipo de prenda eliminado");
    } catch (error) {
      console.error("Error al eliminar tipo de prenda", error);
      toast.error("No se pudo eliminar el tipo de prenda.");
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tipos de Prenda</h1>
          <p className="text-muted-foreground">Define los tipos de prendas disponibles</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Tipo
        </Button>
      </div>

      {error ? (
        <p className="text-red-600 text-center">{error}</p>
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Categorías Asociadas</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tiposPrenda.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Shirt className="h-5 w-5 text-primary" />
                      </div>
                      <span className="font-medium">{tipo.nombre}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {tipo.categorias && tipo.categorias.length > 0 ? (
                        tipo.categorias.map((cat) => (
                          <Badge key={cat.id} variant="secondary" className="text-xs">
                            {cat.nombre}
                          </Badge>
                        ))
                      ) : (
                        <span className="italic text-muted-foreground text-sm">Sin categorías</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge>
                      {typeof tipo.productoCount === 'number' ? tipo.productoCount : 0} productos
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => abrirModalEdicion(tipo)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEliminar(tipo.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ✅ MODAL DE EDICIÓN */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Prenda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="nombre">Nuevo nombre</Label>
            <Input
              id="nombre"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={guardarEdicion}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TiposPrenda;

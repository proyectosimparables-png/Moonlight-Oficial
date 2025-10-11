'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, FolderTree } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getCategoriasConProductos } from "@/services/productos";

type Subcategoria = {
  id: string;
  nombre: string;
};

type CategoriaConProductos = {
  id: string;
  nombre: string;
  seccion: string;
  productoCount: number;
  subcategorias: Subcategoria[];
};

const Categorias = () => {
  const [categorias, setCategorias] = useState<CategoriaConProductos[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      setLoading(true);
      try {
        const data = await getCategoriasConProductos();
        setCategorias(data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
        setError("No se pudieron cargar las categorías.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategorias();
  }, []);

  if (loading) {
    return <p className="text-center mt-8">Cargando categorías...</p>;
  }
  if (error) {
    return <p className="text-center mt-8 text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-heading)]">Categorías</h1>
          <p className="text-[var(--color-dark-gray)]">Organiza tus productos por categorías</p>
        </div>
        <Button className="gap-2 bg-[var(--color-purple)] text-white hover:bg-[var(--color-light-purple)]">
          <Plus className="h-4 w-4" />
          Nueva Categoría
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categorias.map((categoria) => (
          <Card
            key={categoria.id}
            className="group hover:shadow-lg transition-all border min-w-[220px]" // Ajustamos ancho mínimo
          >
            <CardHeader className="relative">
              {/* Íconos flotantes */}
              <div className="absolute top-1.5 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-in-out flex gap-1 z-10">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  style={{
                    backgroundColor: "var(--color-light-purple)",
                    color: "white",
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  style={{
                    backgroundColor: "#e74c3c",
                    color: "white",
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Contenido del header */}
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
                    {categoria.seccion}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--color-dark-gray)]">Productos</span>
                  <Badge variant="secondary">{categoria.productoCount}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2 text-[var(--text-heading)]">
                    Subcategorías:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {categoria.subcategorias && categoria.subcategorias.length > 0 ? (
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
    </div>
  );
};

export default Categorias;

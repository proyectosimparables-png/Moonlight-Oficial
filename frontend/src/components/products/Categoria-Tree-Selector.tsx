"use client";

import { Categoria } from "@/types/categories";
import clsx from "clsx";

interface Props {
  categorias: Categoria[];
  value: string[];
  onChange: (ids: string[]) => void;
}

export function CategoriaTreeSelector({
  categorias,
  value = [],
  onChange,
}: Props) {
  const handleToggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((itemId) => itemId !== id));
    } else {
      onChange([...value, id]);
    }
  };

  // Función recursiva para renderizar TODOS los niveles
  const renderTree = (items: Categoria[], level = 0) => {
    return items.map((cat) => (
      <div key={cat.id} className="flex flex-col">
        <label
          className={clsx(
            "flex items-center gap-3 cursor-pointer py-2 px-3 rounded-lg transition-all duration-200",
            "hover:bg-purple-50 group",
            value.includes(cat.id)
              ? "bg-purple-50/80 font-semibold text-purple-800"
              : "text-gray-700",
          )}
          // Reducimos el marginLeft fijo y usamos el contenedor con borde para la jerarquía
          style={{ marginLeft: level > 0 ? 8 : 0 }}
        >
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 cursor-pointer transition-transform group-active:scale-90"
            checked={value.includes(cat.id)}
            onChange={() => handleToggle(cat.id)}
          />

          <span
            className={clsx(
              "leading-none",
              level === 0
                ? "text-[11px] font-black uppercase tracking-widest text-gray-400"
                : "text-sm",
            )}
          >
            {cat.nombre}
          </span>
        </label>

        {/* Renderizado de hijos con línea conectora visual */}
        {cat.subcategorias && cat.subcategorias.length > 0 && (
          <div className="ml-5 mt-1 mb-2 border-l-2 border-gray-100 pl-4 space-y-1">
            {renderTree(cat.subcategorias, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-1 select-none p-1">
      {renderTree(categorias)}
      {categorias.length === 0 && (
        <p className="text-sm text-gray-400 italic p-4 text-center">
          No hay categorías disponibles para esta sección.
        </p>
      )}
    </div>
  );
}

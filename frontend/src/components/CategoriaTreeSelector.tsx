"use client";

import { Categoria } from "@/types/Categorias";
import clsx from "clsx";

interface Props {
  categorias: Categoria[];
  value?: string;
  onChange: (id: string) => void;
}

export function CategoriaTreeSelector({
  categorias,
  value,
  onChange,
}: Props) {
  return (
    <div className="space-y-1">
      {renderCategorias(categorias, value, onChange)}
    </div>
  );
}

function renderCategorias(
  categorias: Categoria[],
  value: string | undefined,
  onChange: (id: string) => void,
  level = 0
) {
  return categorias.map((cat) => (
    <div key={cat.id}>
      <label
        className={clsx(
          "flex items-center gap-2 cursor-pointer py-1",
          value === cat.id && "font-semibold text-purple-600"
        )}
        style={{ marginLeft: level * 16 }}
      >
        <input
          type="radio"
          name="categoriaId"
          value={cat.id}
          checked={value === cat.id}
          onChange={() => onChange(cat.id)}
        />
        <span>{cat.nombre}</span>
      </label>

    {(cat.subcategorias?.length ?? 0) > 0 &&
  renderCategorias(cat.subcategorias ?? [], value, onChange, level + 1)}

    </div>
  ));
}

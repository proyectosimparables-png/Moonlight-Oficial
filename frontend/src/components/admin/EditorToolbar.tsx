"use client";

import { Editor } from "@tiptap/react";
import { 
  TableCellsIcon, 
  QueueListIcon, 
  ViewColumnsIcon, 
  TrashIcon,
  PlusIcon,
  ListBulletIcon, 
  ChevronRightIcon,
  Squares2X2Icon,
  MinusIcon, 
  PaintBrushIcon 
} from "@heroicons/react/24/outline"; 
import { useState, useRef, useEffect } from "react";

const MenuItem = ({ label, onClick, icon: Icon, danger = false, hasSubmenu = false }: any) => (
  <button
    type="button"
    onClick={onClick}
    className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-100 ${
      danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
    }`}
  >
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
    </div>
    {hasSubmenu && <ChevronRightIcon className="w-3 h-3 text-gray-400" />}
  </button>
);

const TEXT_COLORS = [
  { color: "#000000", label: "Negro" },
  { color: "#6B7280", label: "Gris" },
  { color: "#10B981", label: "Verde" },
  { color: "#EC4899", label: "Rosa" },
  { color: "#4C1D95", label: "Violeta Oscuro" },
  { color: "#A78BFA", label: "Violeta Suave" },
];

export default function EditorToolbar({ editor }: { editor: Editor }) {
  const [isTableOpen, setIsTableOpen] = useState(false);
  const [isColorOpen, setIsColorOpen] = useState(false);
  
  const tableMenuRef = useRef<HTMLDivElement>(null);
  const colorMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tableMenuRef.current && !tableMenuRef.current.contains(event.target as Node)) setIsTableOpen(false);
      if (colorMenuRef.current && !colorMenuRef.current.contains(event.target as Node)) setIsColorOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!editor) return null;

  const isTableActive = editor.isActive("table");

  return (
    <div className="flex flex-wrap gap-1 border-b p-2 bg-gray-50 items-center select-none">
      
      {/* --- FORMATO BÁSICO --- */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
      >
        <b className="font-bold px-1">B</b>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
      >
        <i className="italic font-serif px-1">I</i>
      </button>

      {/* --- COLOR DE LETRA --- */}
      <div className="relative" ref={colorMenuRef}>
        <button
          onClick={() => setIsColorOpen(!isColorOpen)}
          className="p-1.5 rounded hover:bg-gray-200 flex flex-col items-center"
        >
          <PaintBrushIcon className="w-5 h-5" />
          <div className="w-4 h-0.5 mt-0.5" style={{ backgroundColor: editor.getAttributes('textStyle').color || 'black' }}></div>
        </button>

        {isColorOpen && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-gray-200 shadow-xl rounded-md z-50 grid grid-cols-3 gap-2 w-32">
            {TEXT_COLORS.map((c) => (
              <button
                key={c.color}
                onClick={() => {
                  editor.chain().focus().setColor(c.color).run();
                  setIsColorOpen(false);
                }}
                className="w-7 h-7 rounded-full border border-gray-300 shadow-sm"
                style={{ backgroundColor: c.color }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* --- LISTAS --- */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
      >
        <ListBulletIcon className="w-5 h-5" />
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
      >
        <span className="font-semibold text-sm px-1">1.</span>
      </button>

      <button
        onClick={() => editor.chain().focus().insertContent("- ").run()}
        className="p-1.5 rounded hover:bg-gray-200"
      >
        <MinusIcon className="w-5 h-5" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      {/* --- MENÚ DE TABLA COMPLETO --- */}
      <div className="relative" ref={tableMenuRef}>
        <button
          onClick={() => setIsTableOpen(!isTableOpen)}
          className={`flex items-center gap-1 p-1.5 rounded hover:bg-gray-200 ${isTableActive ? "text-blue-600" : ""}`}
        >
          <TableCellsIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Tabla</span>
        </button>

        {isTableOpen && (
          <div className="absolute top-full right-0 md:left-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md z-50 py-1">
            {!isTableActive ? (
              <MenuItem
                label="Insertar tabla 3x3"
                icon={PlusIcon}
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                  setIsTableOpen(false);
                }}
              />
            ) : (
              <>
                <div className="group relative">
                  <MenuItem label="Fila" icon={QueueListIcon} hasSubmenu />
                  <div className="hidden group-hover:block absolute left-full top-0 w-48 bg-white border border-gray-200 shadow-xl rounded-md ml-0.5 py-1">
                    <MenuItem label="Insertar arriba" onClick={() => editor.chain().focus().addRowBefore().run()} />
                    <MenuItem label="Insertar debajo" onClick={() => editor.chain().focus().addRowAfter().run()} />
                    <MenuItem label="Eliminar fila" danger onClick={() => editor.chain().focus().deleteRow().run()} />
                  </div>
                </div>
                <div className="group relative">
                  <MenuItem label="Columna" icon={ViewColumnsIcon} hasSubmenu />
                  <div className="hidden group-hover:block absolute left-full top-0 w-48 bg-white border border-gray-200 shadow-xl rounded-md ml-0.5 py-1">
                    <MenuItem label="Insertar antes" onClick={() => editor.chain().focus().addColumnBefore().run()} />
                    <MenuItem label="Insertar después" onClick={() => editor.chain().focus().addColumnAfter().run()} />
                    <MenuItem label="Eliminar columna" danger onClick={() => editor.chain().focus().deleteColumn().run()} />
                  </div>
                </div>
                <div className="group relative">
                  <MenuItem label="Celda" icon={Squares2X2Icon} hasSubmenu />
                  <div className="hidden group-hover:block absolute left-full top-0 w-48 bg-white border border-gray-200 shadow-xl rounded-md ml-0.5 py-1">
                    <MenuItem label="Combinar celdas" onClick={() => editor.chain().focus().mergeCells().run()} />
                    <MenuItem label="Dividir celda" onClick={() => editor.chain().focus().splitCell().run()} />
                  </div>
                </div>
                <div className="border-t my-1"></div>
                <MenuItem label="Eliminar tabla" danger icon={TrashIcon} onClick={() => editor.chain().focus().deleteTable().run()} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
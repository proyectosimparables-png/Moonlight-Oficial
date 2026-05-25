"use client";

import { useEffect } from "react"; // 🌟 Importamos useEffect
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import EditorToolbar from "./EditorToolbar";
import { TextStyle } from "@tiptap/extension-text-style";
import { Table } from "@tiptap/extension-table";

export default function EditorDescripcion({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepAttributes: true, keepMarks: true },
        orderedList: { keepAttributes: true, keepMarks: true },
      }),
      TextStyle,
      Color,
      Table.configure({
        resizable: true,
        allowTableNodeSelection: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm focus:outline-none max-w-none p-4 min-h-[150px]",
      },
    },
  });

  // 🌟 EL SENSOR DE RESETEO:
  // Si el valor externo cambia a vacío y el editor todavía tiene texto adentro, lo limpiamos de forma manual.
  useEffect(() => {
    if (!editor) return;

    // Si el padre limpió el estado externo, forzamos el vaciado del editor
    if (value === "" && editor.getHTML() !== "<p></p>") {
      editor.commands.setContent("");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="border rounded-md relative bg-white shadow-sm w-full">
      <EditorToolbar editor={editor} />
      <div className="w-full overflow-x-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

"use client";

import { Editor } from "@tiptap/react";

export default function EditorToolbar({ editor }: { editor: Editor }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b p-2 bg-gray-50">
      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        <b>B</b>
      </button>

      <button onClick={() => editor.chain().focus().toggleItalic().run()}>
        <i>I</i>
      </button>

      <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
        • Lista
      </button>

      <button
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        Tabla
      </button>

      <button onClick={() => editor.chain().focus().deleteTable().run()}>
        Eliminar tabla
      </button>
    </div>
  );
}

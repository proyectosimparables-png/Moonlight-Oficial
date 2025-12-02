export async function getComentarios(limit = 5) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comentarios?limit=${limit}`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Error al obtener comentarios");

    return res.json();
  } catch (error) {
    console.error("Error cargando comentarios:", error);
    throw error;
  }
}


export async function createComentario(contenido: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // 👈 las cookies llevan la sesión
      body: JSON.stringify({ contenido }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${res.status} ${errorText}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error creando comentario:", error);
    throw error;
  }
}

// Eliminar comentario (nuevo)
export const deleteComentario = async (id: string): Promise<void> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comentarios/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`No se pudo eliminar el comentario: ${res.status} ${errorText}`);
    }
  } catch (error) {
    console.error("Error eliminando comentario:", error);
    throw error;
  }
};
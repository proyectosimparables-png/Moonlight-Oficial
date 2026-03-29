export async function getComentarios(limit = 15) {
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

// CORREGIDO: Ahora acepta contenido y nombre
export async function createComentario(contenido: string, nombre?: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/comentarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ contenido, nombre }), // Se envían ambos al backend
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

export const deleteComentario = async (id: string | number): Promise<void> => {
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
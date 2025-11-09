


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const agregarFavorito = async (userId: string, productoId: string) => {
  const res = await fetch(`${API_URL}/favoritos/agregar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ userId, productoId }),
  });

  if (!res.ok) {
    throw new Error('Error al agregar favorito');
  }

  return res.json();
};



export const eliminarFavorito = async (userId: string, productoId: string) => {
  const res = await fetch(`${API_URL}/favoritos/eliminar?userId=${userId}&productoId=${productoId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Error al eliminar favorito');
  }

  return res.json();
};


export const obtenerFavoritos = async (userId: string) => {
  const res = await fetch(`${API_URL}/favoritos/todos?userId=${userId}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Error al obtener favoritos');
  }

  return res.json();
};

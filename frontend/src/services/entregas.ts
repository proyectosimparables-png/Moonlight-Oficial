const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/punto-entrega`;

export async function getPuntosEntrega() {
  const res = await fetch(BASE_URL);
  return res.json();
}

export async function createPuntoEntrega(data: any) {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deletePuntoEntrega(id: string) {
  const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
  return res.json();
}

export async function updatePuntoEntrega(id: string, data: any) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

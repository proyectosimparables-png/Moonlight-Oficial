export async function getUserHistorial() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/historial/mi-historial`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error: ${res.status} ${text}`);
  }

  return res.json();
}

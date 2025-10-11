const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchTotalProductos(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/dashboard/total-productos`);
  if (!res.ok) throw new Error('Error fetching total productos');
  return res.json();
}


export async function fetchOrdenesActivas() {
  const res = await fetch(`${API_BASE_URL}/dashboard/ordenes-activas`);
  if (!res.ok) throw new Error('Error fetching ordenes activas');
  return res.json();
}

export async function fetchUsuariosRegistrados() {
  const res = await fetch(`${API_BASE_URL}/dashboard/usuarios-registrados`);
  if (!res.ok) throw new Error('Error fetching usuarios registrados');
  return res.json();
}

export async function fetchVentasDelMes() {
  const res = await fetch(`${API_BASE_URL}/dashboard/ventas-del-mes`);
  if (!res.ok) throw new Error('Error fetching ventas del mes');
  return res.json();
}

export async function fetchVentasRecientes() {
  const res = await fetch(`${API_BASE_URL}/dashboard/ventas-recientes`);
  if (!res.ok) throw new Error('Error fetching ventas recientes');
  return res.json();
}

export async function fetchProductosPopulares() {
  const res = await fetch(`${API_BASE_URL}/dashboard/productos-populares`);
  if (!res.ok) throw new Error('Error fetching productos populares');
  return res.json();
}

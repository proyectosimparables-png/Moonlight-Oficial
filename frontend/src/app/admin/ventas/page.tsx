import OrdenesTable from "@/components/admin/OrderActions";


// Esta función corre en el servidor
async function fetchOrdenes() {
  const response = await fetch('http://localhost:3000/ordenes', {
    cache: 'no-store', // Importante para ver cambios en tiempo real
  });
  
  if (!response.ok) return [];
  return response.json();
}

export default async function VentasPage() {
  const ordenes = await fetchOrdenes();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex flex-col mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight">Ventas</h1>
        <p className="text-gray-500">Administra los pedidos y estados de envío de Moonlight.</p>
      </div>
      
      <OrdenesTable ordenes={ordenes} />
    </div>
  );
}

import FormProducto from '@/components/admin/FormProducto';
import NavbarAdmin from '@/components/admin/NavbarAdmin';

export default function NuevoProductoPage() {
  return (
    <div>
      <main className="p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Publicar nuevo producto</h2>
        <FormProducto />
        <NavbarAdmin />
      </main>
    </div>
  );
}

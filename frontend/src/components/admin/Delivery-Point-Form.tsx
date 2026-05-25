"use client";
import { useState, useEffect } from "react";
import {
  getPuntosEntrega,
  createPuntoEntrega,
  deletePuntoEntrega,
  updatePuntoEntrega,
} from "@/services/envios/delivery-points-service";
import {
  TrashIcon,
  PencilSquareIcon,
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function GestionPuntosEntrega() {
  // 1. SOLUCIÓN AL ERROR .MAP: Inicializar siempre como array vacío []
  const [puntos, setPuntos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<any | null>(null); // Para el Modal

  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    localidad: "",
    disponibilidad: "",
    costo: 0,
    esDomicilio: false,
  });

  const cargarPuntos = async () => {
    try {
      const data = await getPuntosEntrega();
      // Verificamos que 'data' sea un array antes de setearlo
      setPuntos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setPuntos([]); // Si falla, queda como array vacío para que no rompa el .map
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPuntos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPuntoEntrega(formData);
      toast.success("Punto creado");
      setFormData({
        nombre: "",
        direccion: "",
        localidad: "",
        disponibilidad: "",
        costo: 0,
        esDomicilio: false,
      });
      cargarPuntos();
    } catch (error) {
      toast.error("Error al crear");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updatePuntoEntrega(editando.id, editando);
      toast.success("Punto actualizado");
      setEditando(null); // Cerrar modal
      cargarPuntos();
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleEliminar = async (id: string) => {
    if (!confirm("¿Eliminar este punto?")) return;
    try {
      await deletePuntoEntrega(id);
      toast.success("Eliminado");
      cargarPuntos();
    } catch (error) {
      toast.error("Error");
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 p-4 relative">
      {/* FORMULARIO DE CREACIÓN */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-4"
      >
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2">
          Configurar Entrega
        </h3>
        <div className="space-y-3">
          <input
            placeholder="Nombre"
            className="w-full border p-2 rounded-lg text-sm"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
          <select
            className="w-full border p-2 rounded-lg text-sm bg-gray-50"
            value={formData.esDomicilio.toString()}
            onChange={(e) =>
              setFormData({
                ...formData,
                esDomicilio: e.target.value === "true",
                costo: e.target.value === "true" ? 0 : formData.costo,
              })
            }
          >
            <option value="false">Punto de encuentro (Pago)</option>
            <option value="true">Mi Domicilio (Gratis)</option>
          </select>
          <input
            placeholder="Dirección"
            className="w-full border p-2 rounded-lg text-sm"
            value={formData.direccion}
            onChange={(e) =>
              setFormData({ ...formData, direccion: e.target.value })
            }
            required
          />
          <input
            placeholder="Localidad"
            className="w-full border p-2 rounded-lg text-sm"
            value={formData.localidad}
            onChange={(e) =>
              setFormData({ ...formData, localidad: e.target.value })
            }
            required
          />
          <input
            placeholder="Horarios"
            className="w-full border p-2 rounded-lg text-sm"
            value={formData.disponibilidad}
            onChange={(e) =>
              setFormData({ ...formData, disponibilidad: e.target.value })
            }
            required
          />
          {!formData.esDomicilio && (
            <input
              placeholder="Costo"
              className="w-full border p-2 rounded-lg text-sm"
              value={formData.costo}
              onChange={(e) =>
                setFormData({ ...formData, costo: Number(e.target.value) })
              }
            />
          )}
        </div>
        <button className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-semibold hover:bg-purple-700 transition-all">
          Guardar Punto
        </button>
      </form>

      {/* LISTADO */}
      <div className="w-full max-w-md space-y-3">
        <h4 className="font-bold text-gray-700 px-1">Puntos cargados</h4>
        {loading ? (
          <p className="text-center text-sm text-gray-400">Cargando...</p>
        ) : (
          puntos.map((punto: any) => (
            <div
              key={punto.id}
              className="bg-white border rounded-xl p-4 shadow-sm flex justify-between items-center group"
            >
              <div className="space-y-1">
                <p className="font-bold text-gray-800 text-sm">
                  {punto.nombre}
                </p>
                <div className="text-xs text-gray-500">
                  <p>
                    {punto.direccion}, {punto.localidad}
                  </p>
                  <p className="text-purple-600 font-medium">
                    {punto.costo === 0 ? "Gratis" : `$${punto.costo}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setEditando(punto)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-full"
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleEliminar(punto.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL DE EDICIÓN (VENTANITA) */}
      {editando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setEditando(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold mb-4">Editar Punto</h3>

            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                className="w-full border p-2 rounded-lg"
                value={editando.nombre}
                onChange={(e) =>
                  setEditando({ ...editando, nombre: e.target.value })
                }
                required
              />
              <input
                className="w-full border p-2 rounded-lg"
                value={editando.direccion}
                onChange={(e) =>
                  setEditando({ ...editando, direccion: e.target.value })
                }
                required
              />
              <input
                className="w-full border p-2 rounded-lg"
                value={editando.localidad}
                onChange={(e) =>
                  setEditando({ ...editando, localidad: e.target.value })
                }
                required
              />
              <input
                className="w-full border p-2 rounded-lg"
                value={editando.disponibilidad}
                onChange={(e) =>
                  setEditando({ ...editando, disponibilidad: e.target.value })
                }
                required
              />
              {!editando.esDomicilio && (
                <input
                  type="number"
                  className="w-full border p-2 rounded-lg"
                  value={editando.costo}
                  onChange={(e) =>
                    setEditando({ ...editando, costo: Number(e.target.value) })
                  }
                />
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditando(null)}
                  className="flex-1 bg-gray-100 py-2 rounded-lg font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700"
                >
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

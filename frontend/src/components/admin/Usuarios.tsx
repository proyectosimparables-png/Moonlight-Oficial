"use client";

import React, { useEffect, useState } from "react";
import { getAllUsers } from "@/services/userService";
import { supabase } from "@/lib/supabaseClient";

interface Usuario {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  image?: string;
}

const UsuariosPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();

        // ✅ Determina si el backend devuelve { users: [...] } o directamente un array
        const usersArray: Usuario[] = Array.isArray(data)
          ? data
          : Array.isArray(data.users)
            ? data.users
            : [];

        // Paso 1: mapeamos los usuarios con una imagen por defecto
        let enrichedUsers: Usuario[] = usersArray.map((user: Usuario) => ({
          ...user,
          image: "/default-avatar.png",
        }));

        // Paso 2: obtenemos el usuario actual autenticado desde Supabase
        const { data: authData } = await supabase.auth.getUser();
        const currentUser = authData?.user;

        if (currentUser) {
          const avatar = currentUser.user_metadata?.avatar_url as
            | string
            | undefined;
          const email = currentUser.email;

          // Si coincide el email, reemplazamos su imagen
          if (avatar && email) {
            enrichedUsers = enrichedUsers.map((user: Usuario) =>
              user.email === email ? { ...user, image: avatar } : user,
            );
          }
        }

        setUsuarios(enrichedUsers);
      } catch (error) {
        console.error("Error obteniendo usuarios:", error);
        setError("Error al cargar usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500">Cargando usuarios...</p>
    );
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="p-6 bg-purple-50 min-h-screen">
      <h1 className="text-2xl font-bold text-purple-800 mb-6">
        Usuarios del sistema
      </h1>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-purple-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-purple-900">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-purple-900">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-purple-900">
                Rol
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase text-purple-900">
                Fecha de registro
              </th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u: Usuario) => (
              <tr key={u.id} className="border-t hover:bg-purple-50 transition">
                <td className="px-4 py-3 flex items-center gap-3 text-purple-800 font-medium">
                  <img
                    src={u.image || "/default-avatar.png"}
                    className="w-10 h-10 rounded-full border border-purple-300 object-cover"
                  />
                  <span>{u.name || "Sin nombre"}</span>
                </td>
                <td className="px-4 py-3 text-purple-800 font-medium">
                  {u.email}
                </td>
                <td className="px-4 py-3 text-purple-800 font-medium">
                  {u.role}
                </td>
                <td className="px-4 py-3 text-purple-800 font-medium">
                  {new Date(u.createdAt).toLocaleDateString("es-ES")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosPage;

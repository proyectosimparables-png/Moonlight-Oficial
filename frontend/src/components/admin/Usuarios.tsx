"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getAllUsers } from "@/services/userService";

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

        const usersArray: Usuario[] = Array.isArray(data)
          ? data
          : Array.isArray(data.users)
          ? data.users
          : [];

        // Agregamos avatar real o uno generado automáticamente
        const enrichedUsers: Usuario[] = usersArray.map((user) => {
          // Si ya tiene imagen, la usamos
          if (user.image) return user;

          // Si no, generamos con UI Avatars usando el nombre
          const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name || "Sin Nombre"
          )}&background=8b5cf6&color=fff&size=128`;

          return { ...user, image: avatarUrl };
        });

        setUsuarios(enrichedUsers);
      } catch (err) {
        console.error("Error obteniendo usuarios:", err);
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
                  <Image
                    src={u.image || "/logo.png"}
                    alt={u.name || "Avatar"}
                    width={40}
                    height={40}
                    className="rounded-full border border-purple-300 object-cover"
                  />
                  <span>{u.name || "Sin nombre"}</span>
                </td>
                <td className="px-4 py-3 text-purple-800 font-medium">{u.email}</td>
                <td className="px-4 py-3 text-purple-800 font-medium">{u.role}</td>
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

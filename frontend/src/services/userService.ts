// services/userService.ts

import { getAuthHeaders } from "@/lib/authHelpers";

export async function getUserProfile() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/protected`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error: ${res.status} ${text}`);
  }

  return res.json();
}

//usuarios.ts
export async function getAllUsers() {
  try {
    const headers = await getAuthHeaders();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/usuarios`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...headers, // 🔹 Agrega el token de sesión
        },
        credentials: "include",
      },
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`${res.status} ${errorText}`);
    }

    return res.json();
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    throw error;
  }
}
export async function updateUserAddress(address: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/update-address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ address }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Error: ${res.status} ${text}`);
  }

  return res.json();
}


export async function editUserAddress(address: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/edit-address`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ address }),
  });

  if (!res.ok) {
    throw new Error("Error al editar domicilio");
  }

  return res.json();
}

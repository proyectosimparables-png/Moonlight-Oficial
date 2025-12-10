export async function loginLocal(email: string, password: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/login`, {
    method: "POST",
    credentials: "include", // Esto es fundamental para que se guarden las cookies
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) throw new Error("Error al iniciar sesión");

  return true;
}

export async function registerLocal(
  name: string,
  email: string,
  password: string,
  address: string
) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/register`, {
    method: "POST",
    credentials: "include", // Aquí también
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, address }),
  });

  if (!res.ok) throw new Error("Error al registrar usuario");

  return true;
}
export async function getLocalUser() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/me`, {
    credentials: "include",
  });

  if (!res.ok) return null;
  return await res.json();
}

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
export async function verifyEmailLocal(code: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/verify-email`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Código inválido o expirado");
  }

  return true;
}

export async function resendCodeLocal() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/local/resend-verification`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("No se pudo reenviar el código");
  return true;
}
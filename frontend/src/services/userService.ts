// services/userService.ts

export async function getUserProfile() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/protected`, {
    method: "GET",
    credentials: "include", // 👈 Importante para enviar cookies
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error: ${res.status} ${text}`)
  }

  return res.json()
}

"use client"

import { useAuth } from "@/hooks/useAuth"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"

export const LoginButton = () => {
  const { isAuthenticated, login, logout, user } = useAuth()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={isAuthenticated ? logout : login}
      className="hover:bg-[#e6dff1]"
      title={isAuthenticated ? `Cerrar sesión (${user?.email})` : "Iniciar sesión con Google"}
    >
      <User className="h-7 w-7 text-[#7b5ca2]" />
    </Button>
  )
}

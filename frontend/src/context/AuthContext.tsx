"use client"

import { createContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { Session, User } from "@supabase/supabase-js"
import { getUserProfile } from "@/services/userService" // ✅ Importado

type AuthContextType = {
  session: Session | null
  user: User | null
  isAuthenticated: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session ?? null)

      if (data.session) {
        await sendTokenToBackend(data.session.access_token)

        try {
          const response = await getUserProfile()
          console.log("✅ Usuario sincronizado:", response.user)
        } catch (err) {
          console.error("❌ Error al sincronizar usuario:", err)
        }
      }
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session ?? null)

        if (session) {
          await sendTokenToBackend(session.access_token)

          try {
            const response = await getUserProfile()
            console.log("✅ Usuario sincronizado:", response.user)
          } catch (err) {
            console.error("❌ Error al sincronizar usuario:", err)
          }
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const sendTokenToBackend = async (token: string) => {
    try {
      await fetch("http://localhost:3000/auth/set-cookie", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })
    } catch (error) {
      console.error("Error al enviar token al backend:", error)
    }
  }

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    })
    if (error) console.error("Error al iniciar sesión:", error)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)

    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      })
    } catch (error) {
      console.error("Error al hacer logout en backend:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }

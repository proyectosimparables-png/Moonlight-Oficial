"use client"

import { createContext,  useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { Session, User } from "@supabase/supabase-js"

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
    }

    getSession()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null)
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    })
    if (error) console.error("Error al iniciar sesión:", error)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setSession(null)
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

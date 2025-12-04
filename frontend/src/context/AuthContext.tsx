"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { AuthUser, Session } from "@supabase/supabase-js";
import { getUserProfile } from "@/services/userService";
import { ExtendedUser } from "@/types/types-user";


type AuthContextType = {
  setUser(arg0: (prev: any) => any): unknown;
  session: Session | null;
  user: ExtendedUser | null;       
  isAuthenticated: boolean;
  role: string | null;
  authLoaded: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  // 🔥 Combina Supabase + Backend en un solo usuario
  const mergeUser = (supabaseUser: AuthUser, backendUser: any): ExtendedUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? "",
      user_metadata: supabaseUser.user_metadata,

      // 👇 Datos de tu BD
      name: backendUser?.name,
      role: backendUser?.role,
      image: backendUser?.image,
      address: backendUser?.address,
      createdAt: backendUser?.createdAt,
      updatedAt: backendUser?.updatedAt,
    };
  };

  // 🔥 Cargar sesión y usuario
  const loadSessionAndUser = async () => {
    const { data } = await supabase.auth.getSession();
    const currentSession = data.session;
    setSession(currentSession ?? null);

    if (currentSession) {
      await sendTokenToBackend(currentSession.access_token);

      try {
        const response = await getUserProfile(); // /auth/protected
        const backendUser = response.user;

        const merged = mergeUser(currentSession.user, backendUser);
        setUser(merged);

        if (merged.role) {
          setRole(merged.role);
        }
      } catch (error) {
        console.error("❌ Error obteniendo user backend:", error);
      }
    }

    setAuthLoaded(true);
  };

  useEffect(() => {
    loadSessionAndUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session ?? null);

        if (!session) {
          setUser(null);
          setRole(null);
          return;
        }

        await sendTokenToBackend(session.access_token);

        try {
          const response = await getUserProfile();
          const backendUser = response.user;

          const merged = mergeUser(session.user, backendUser);
          setUser(merged);

          if (merged.role) {
            setRole(merged.role);
          }

        } catch (error) {
          console.error("❌ Error sincronizando usuario:", error);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const sendTokenToBackend = async (token: string) => {
    try {
      await fetch("http://localhost:3000/auth/set-cookie", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
    } catch (error) {
      console.error("Error enviando token al backend:", error);
    }
  };

  const login = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });
    if (error) console.error("Error al iniciar sesión:", error);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);

    try {
      await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error al hacer logout:", error);
    }
  };

  if (!authLoaded) return <div className="p-4">Cargando autenticación...</div>;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated: !!session,
        role,
        login,
        logout,
        authLoaded,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };

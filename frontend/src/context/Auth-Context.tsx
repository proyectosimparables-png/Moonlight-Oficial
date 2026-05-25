"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback, // ✅ Agregado para estabilidad de funciones
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { ExtendedUser } from "@/types/user";
import type { Session } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ProviderType = "supabase" | "local" | null;

interface AuthContextType {
  role: string | null;
  user: ExtendedUser | null;
  provider: ProviderType;
  isAuthenticated: boolean;
  authLoaded: boolean;
  session: Session | null;
  loginGoogle: () => void;
  loginLocal: (email: string, password: string) => Promise<void>;
  registerLocal: (data: {
    name: string;
    email: string;
    password: string;
    address: string;
  }) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [provider, setProvider] = useState<ProviderType>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const pathname = usePathname();

  // --- Funciones de Sincronización ---

  const syncSupabaseSession = useCallback(async (token: string) => {
    try {
      await fetch(`${API_URL}/auth/set-cookie`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      return true;
    } catch (error) {
      console.error("Error enviando token al backend:", error);
      return false;
    }
  }, []);

  const loadLocalUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/local/me`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) return false;

      const data = await res.json();

      setUser({
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        image: data.user.image,
        address: data.user.address,
        createdAt: data.user.createdAt,
        updatedAt: data.user.updatedAt,
      });

      setProvider("local");
      return true;
    } catch (err) {
      console.error("[Auth] loadLocalUser error:", err);
      return false;
    }
  }, []);

  const loadSupabaseUser = useCallback(
    async (currentSession: Session) => {
      const synced = await syncSupabaseSession(currentSession.access_token);
      if (!synced) return false;

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });

        if (!res.ok) return false;

        const backend = await res.json();

        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email!,
          user_metadata: currentSession.user.user_metadata,
          name: backend.user.name,
          address: backend.user.address,
          image: backend.user.image,
          role: backend.user.role,
          createdAt: backend.user.createdAt,
          updatedAt: backend.user.updatedAt,
        });

        setProvider("supabase");
        return true;
      } catch (err) {
        console.error("Error en loadSupabaseUser:", err);
        return false;
      }
    },
    [syncSupabaseSession],
  );

  // --- Inicialización y Listeners ---

  useEffect(() => {
    const init = async () => {
      const isLocal = await loadLocalUser();
      if (isLocal) {
        setAuthLoaded(true);
        return;
      }

      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession) {
        await loadSupabaseUser(currentSession);
      }
      setAuthLoaded(true);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (!session) {
          setUser(null);
          setProvider(null);
        } else {
          await fetch(`${API_URL}/auth/local/logout`, {
            method: "POST",
            credentials: "include",
          });
          await loadSupabaseUser(session);
        }
      },
    );

    return () => listener.subscription.unsubscribe();
  }, [loadLocalUser, loadSupabaseUser]); // ✅ Warnings eliminados aquí

  // --- Métodos de Autenticación ---

  const loginLocal = async (email: string, password: string) => {
    await supabase.auth.signOut();
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    const res = await fetch(`${API_URL}/auth/local/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Credenciales inválidas");
    await loadLocalUser();
  };

  const registerLocal = async (data: {
    name: string;
    email: string;
    password: string;
    address: string;
  }) => {
    await supabase.auth.signOut();
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    const res = await fetch(`${API_URL}/auth/local/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al registrar usuario local");
    await loadLocalUser();
  };

  const loginGoogle = () => {
    fetch(`${API_URL}/auth/local/logout`, {
      method: "POST",
      credentials: "include",
    });
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  useEffect(() => {
    if (pathname === "/auth/callback" || pathname === "/") {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) loadSupabaseUser(data.session);
      });
    }
  }, [pathname, loadSupabaseUser]); // ✅ Warning eliminado aquí

  const logout = async () => {
    try {
      setUser(null);
      setProvider(null);
      setSession(null);

      await Promise.allSettled([
        supabase.auth.signOut(),
        fetch(`${API_URL}/auth/local/logout`, {
          method: "POST",
          credentials: "include",
        }),
        fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          credentials: "include",
        }),
      ]);
    } catch (error) {
      console.error("Error en el proceso de logout:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        provider,
        isAuthenticated: !!user,
        authLoaded,
        session,
        loginGoogle,
        loginLocal,
        registerLocal,
        logout,
        setUser,
        role: user?.role || null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};

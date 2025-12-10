"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ExtendedUser } from "@/types/types-user";
import type { Session } from "@supabase/supabase-js"; 
import { usePathname } from 'next/navigation'; // Importante para manejar el callback de Supabase

// Usaremos un entorno local o de producción en el endpoint
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type ProviderType = "supabase" | "local" | null;

interface AuthContextType {
  user: ExtendedUser | null;
  provider: ProviderType;
  isAuthenticated: boolean;
  authLoaded: boolean;
  session: Session | null;

  // Login / Registro
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [provider, setProvider] = useState<ProviderType>(null);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const pathname = usePathname(); // Obtenemos el path actual

  // --- Funciones de Sincronización ---

  // 1) Sincronizar Token de Supabase con el Backend (guarda 'access_token' cookie)
  const syncSupabaseSession = async (token: string) => {
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
  };

  // 2) Cargar Usuario Local (/auth/local/me)
  const loadLocalUser = async () => {
    try {
      const res = await fetch(`${API_URL}/auth/local/me`, {
        credentials: "include", // Esto enviará la cookie 'auth_token'
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
      return false;
    }
  };

  // 3) Cargar Usuario Supabase/Google (/auth/me)
  const loadSupabaseUser = async (currentSession: Session) => {
    // Paso 1: Sincronizar token en cookie
    const synced = await syncSupabaseSession(currentSession.access_token);
    if (!synced) return false;

    try {
      // Paso 2: Obtener perfil completo del backend (usa la cookie recién sincronizada)
      const res = await fetch(`${API_URL}/auth/me`, {
        credentials: "include", 
      });

      if (!res.ok) return false;

      const backend = await res.json();

      // Mapeo de datos unificado
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
  };

  // --- Inicialización y Listeners ---

  useEffect(() => {
    const init = async () => {
      // 1. Intentar cargar usuario local primero (se verifica por la cookie 'auth_token')
      const isLocal = await loadLocalUser();
      if (isLocal) {
        setAuthLoaded(true);
        return;
      }

      // 2. Si no hay usuario local, revisar Supabase (se verifica por la sesión activa)
      const { data } = await supabase.auth.getSession();
      const currentSession = data.session;
      setSession(currentSession);

      if (currentSession) {
        await loadSupabaseUser(currentSession);
      }
      
      // 3. Marcamos la carga como finalizada
      setAuthLoaded(true);
    };

    init();

    // 4. Listener Supabase: maneja cambios de estado (login/logout/refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      
      if (!session) {
        // Logout de Supabase
        setUser(null);
        setProvider(null);
      } else {
        // Nuevo login/refresh de Supabase
        // Aseguramos que la sesión local esté limpia antes de cargar Supabase
        await fetch(`${API_URL}/auth/local/logout`, { method: "POST", credentials: "include" });
        await loadSupabaseUser(session);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [pathname]); // Dependencia 'pathname' para reaccionar mejor al callback

  // --- Métodos de Autenticación ---

  // 5) Login Local
  const loginLocal = async (email: string, password: string) => {
    // Cerrar sesión de Supabase/Google por si acaso
    await supabase.auth.signOut(); 
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }); // Limpiar cookie de Supabase

    const res = await fetch(`${API_URL}/auth/local/login`, {
      method: "POST",
      credentials: "include", 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) throw new Error("Credenciales inválidas");

    // Cargar y establecer el usuario local
    await loadLocalUser();
  };

  // 6) Register Local
  const registerLocal = async (data: {
    name: string; email: string; password: string; address: string;
  }) => {
    // Cerrar sesión de Supabase/Google por si acaso
    await supabase.auth.signOut(); 
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" }); // Limpiar cookie de Supabase

    const res = await fetch(`${API_URL}/auth/local/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Error al registrar usuario local");

    // Cargar y establecer el usuario local
    await loadLocalUser();
  };

  // 7) Login Google (Supabase OAuth)
  const loginGoogle = async () => {
    // Cerrar sesión local por si acaso
    await fetch(`${API_URL}/auth/local/logout`, { method: "POST", credentials: "include" });
    
    supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // 8) Logout UNIFICADO
  const logout = async () => {
    // 1. Supabase logout
    await supabase.auth.signOut();

    // 2. Local logout (limpia 'auth_token')
    await fetch(`${API_URL}/auth/local/logout`, {
      method: "POST",
      credentials: "include",
    });

    // 3. Clear Google Cookie (limpia 'access_token')
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setProvider(null);
    setSession(null);
  };

  // --- Renderizado ---

  // Mitigación de error de Hidratación:
  // Usamos un mensaje de carga hasta que el proceso asíncrono termine.
  if (!authLoaded) return <div className="p-4">Cargando autenticación...</div>;

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usarlo fácil
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
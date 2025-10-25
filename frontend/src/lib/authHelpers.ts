// lib/authHelpers.ts
import { supabase } from "./supabaseClient";

export async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession();
  const session = data?.session;
  if (!session?.access_token) {
    throw new Error("No hay sesión activa");
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
  };
}

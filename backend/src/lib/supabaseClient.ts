// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

// Leemos las variables de entorno
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_KEY!;

// Creamos el cliente (solo para Auth)

export const supabase: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

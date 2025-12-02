export interface ExtendedUser {
  // Datos que vienen de Supabase
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };

  // Datos que vienen del backend (Prisma)
  name?: string;
  image?: string;
  role?: string;

  // 👇 Aquí está nuestro campo domicilio
  address?: string;

  createdAt?: string;
  updatedAt?: string;
}

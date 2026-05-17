// src/types/auth.ts

export interface UserAuthProfile {
    id: string;
    name: string;
    email: string;
    address?: string | null;
    role: "USER" | "ADMIN";
    isVerified: boolean;
    createdAt: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password?: string;
    address?: string;
}
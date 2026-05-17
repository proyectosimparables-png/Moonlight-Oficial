// src/utils/utils.ts

export function getVipCode(): string | null {
    if (typeof window === "undefined") return null;

    // Busca la cookie 'moonlight_vip_access' en el navegador
    const match = document.cookie.match(/(?:^|; )moonlight_vip_access=([^;]*)/);

    // Si la encuentra, devuelve su valor decodificado, si no, devuelve null
    return match ? decodeURIComponent(match[1]) : null;
}
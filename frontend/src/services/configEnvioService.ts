const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const getConfigEnvio = async () => {
    const res = await fetch(`${API_URL}/configuracion-tienda`, { cache: "no-store" });
    return res.ok ? await res.json() : null;
};

export const updateConfigEnvio = async (id: string, data: { montoMinimo: number; activo: boolean }) => {
    const res = await fetch(`${API_URL}/configuracion-tienda/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return res.ok;
};
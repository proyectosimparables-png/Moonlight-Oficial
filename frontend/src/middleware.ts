// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. EXCEPCIONES: No interceptar admin, auth, la propia página de mantenimiento ni archivos estáticos
    if (
        pathname === '/mantenimiento' ||
        pathname.startsWith('/admin') ||  // 👈 ¡ESTO EVITA QUE TE ECHE DEL PANEL!
        pathname.startsWith('/auth') ||   // 👈 Deja loguearse sin problemas
        pathname.startsWith('/_next') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    try {
        // 2. Consultamos la configuración dinámica al backend
        const configRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/configuracion-tienda/publico`, {
            next: { revalidate: 60 }
        });

        if (!configRes.ok) return NextResponse.next();

        const config = await configRes.json();

        // 3. Si el mantenimiento está activo en la DB
        if (config.mantenimientoActivo) {

            // 4. Verificamos si el usuario tiene la cookie del "Pase VIP"
            const vipPassCookie = request.cookies.get('moonlight_vip_access')?.value;

            // Si la cookie coincide con el código, DEJAR PASAR a la tienda normal
            if (vipPassCookie === config.mantenimientoCodigo) {
                return NextResponse.next();
            }

            // 5. Si no tiene el código o es incorrecto, redirigir a mantenimiento
            const url = new URL('/mantenimiento', request.url);
            url.searchParams.set('msg', config.mantenimientoMensaje);

            return NextResponse.redirect(url);
        }

    } catch (error) {
        console.error("Error en el escudo de mantenimiento:", error);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    ],
}
export const getShippingRates = async (cp: string, cartItems: any[] = []) => {
    // Log para verificar qué contiene cartItems antes de mapear
    console.log("Cart items antes de mapear:", cartItems);

    // Verificar si cartItems tiene productos válidos
    if (cartItems.length === 0) {
        console.warn("El array cartItems está vacío, por favor revisa cómo se están añadiendo los productos.");
    }

    // Si cartItems es undefined, usará [] y no tirará error el .map
    const items = (cartItems || []).map(item => ({
        productoId: item.productoId || item.id, // AHORA: Usamos el ID del producto real
        cantidad: item.quantity
    }));
    console.log("Items enviados al backend:", items);
    // Log para verificar qué contiene el array 'items' después de mapear
    console.log("Items enviados a la API:", items);

    // Verificar si algún item tiene un valor inválido o nulo para productoId o cantidad
    items.forEach((item, index) => {
        if (!item.productoId || item.cantidad === undefined || item.cantidad <= 0) {
            console.warn(`Item inválido en el índice ${index}:`, item);
        }
    });

    // Hacer la solicitud POST con el cuerpo (body) que contiene cpDestino y items
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/correo/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpDestino: cp, items })
    });

    // Si la respuesta no es OK, lanzar un error
    if (!res.ok) throw new Error("Error al obtener tarifas");

    // Devolver la respuesta como JSON
    return res.json();
};
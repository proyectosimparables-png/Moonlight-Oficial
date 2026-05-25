"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // 👈 Importamos el hook de navegación

const WhatsAppFloat = () => {
  const whatsappNumber = "+542226622903";
  const message = "Hola! Me interesa obtener mas información!";
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname(); // 👈 Obtenemos la ruta actual

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Esperamos a que el componente esté montado en el cliente
  if (!mounted) {
    return null;
  }

  // 🚫 Si la ruta NO es la raíz (Home), no renderizamos nada
  if (pathname !== "/") {
    return null;
  }

  return (
    // Contenedor barra flotante de extremo a extremo (invisible al click)
    <div className="fixed bottom-6 left-0 right-0 px-6 z-50 flex justify-between items-end pointer-events-none">
      {/* 🟢 WhatsApp (Izquierda) */}
      <div className="relative group pointer-events-auto">
        <Button
          onClick={handleWhatsAppClick}
          className="h-16 w-16 p-0 rounded-full bg-green-500 hover:bg-green-600 text-white shadow-xl transition-transform hover:scale-110"
          aria-label="Contactar por WhatsApp"
        >
          <Image
            src="/icons8-whatsapp-48.png"
            alt="WhatsApp"
            width={32}
            height={32}
            priority
          />
        </Button>

        {/* Tooltip WhatsApp */}
        <div className="absolute bottom-20 left-0 bg-neutral-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md">
          ¿Necesitas ayuda? Escríbenos
          <div className="absolute top-full left-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800" />
        </div>
      </div>

      {/* 🐾 Sticker Mascota (Derecha) */}
      <div className="pointer-events-auto transition-transform hover:scale-105 duration-300">
        <Image
          src="/jefecito-cute.png"
          alt="Mascota Moonlight"
          width={150}
          height={150}
          priority
          className="drop-shadow-xl object-contain"
        />
      </div>
    </div>
  );
};

export default WhatsAppFloat;

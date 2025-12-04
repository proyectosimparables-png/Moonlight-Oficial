'use client';

import Image from 'next/image';
import { Button } from '../ui/button';


const WhatsAppFloat = () => {
  const whatsappNumber = '+542226622903';
  const message = 'Hola! Me interesa obtener mas información!';

  const handleWhatsAppClick = () => {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
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

      {/* Tooltip */}
      <div className="absolute bottom-20 right-0 bg-neutral-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        ¿Necesitas ayuda? Escríbenos
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-800" />
      </div>
    </div>
  );
};

export default WhatsAppFloat;  

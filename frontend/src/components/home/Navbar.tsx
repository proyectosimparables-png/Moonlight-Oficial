"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";

const TopBanner = () => {
  const text =
    "💳3 CUOTAS SIN INTERÉS!   |  💸10% OFF por transferencia  |  🚚ENVÍO GRATIS a partir de $20.000   |  🔥NUEVAS REBAJAS en productos seleccionados!   |    ";

  return (
    <div className="bg-[#cebbf5] text-gray-500 text-[11px] font-normal select-none overflow-hidden relative h-9 flex items-center">
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="px-4">{text.repeat(20)}</span>
        <span className="px-4">{text.repeat(20)}</span>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 300s linear infinite;
        }
      `}</style>
    </div>
  );
};

const Navbar = () => {
  const router = useRouter();
  const [cartCount] = useState(3);
  const { isAuthenticated, login, logout, user } = useAuth();

  const bottomLinks = [
    { label: "Inicio" },
    { label: "Productos ▼" },
    { label: "Contacto" },
    { label: "Políticas de Cambio" },
    { label: "Tabla de talles" },
    { label: "¿Quiénes somos?" },
    { label: "Instagram" },
  ];

  // Función para manejar click en carrito
  const handleCartClick = () => {
    if (isAuthenticated) {
      // Aquí podés redirigir al carrito si existe ruta o funcionalidad
      router.push("/cart"); // ejemplo
    } else {
      // Si no está autenticado, lo enviamos a login o a la página que uses
      router.push("/auth/login");
    }
  };

  return (
    <>
      <TopBanner />

      {/* Contenedor de ambas barras fijas */}
      <div className="sticky top-0 z-50">
        {/* Navbar superior */}
        <nav className="bg-[#FAFCEF] backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              {/* Search Desktop */}
              <div className="hidden md:flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#aaa]" />
                  <Input
                    type="search"
                    placeholder="Buscar productos..."
                    className="pl-10 w-64 bg-white border border-[#ccc] rounded-md text-sm"
                  />
                </div>
              </div>

              {/* Center: Logo */}
              <div className="absolute left-1/2 transform -translate-x-1/2">
                <Image
                  src="/moonlight.png"
                  alt="Moonlight Logo"
                  width={140}
                  height={40}
                  priority
                />
              </div>

              {/* Right: Login & Cart */}
              <div className="flex items-center gap-2">
                {/* Mobile Search */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden hover:bg-[#e6dff1]"
                    >
                      <Search className="h-5 w-5 text-[#7b5ca2]" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="h-32 bg-[#f5f0fa]">
                    <div className="relative mt-8">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#aaa]" />
                      <Input
                        type="search"
                        placeholder="Buscar productos..."
                        className="pl-10 w-full bg-white border border-[#ccc] rounded-md"
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Login Button */}
                <Button
                  variant="ghost"
                  onClick={isAuthenticated ? logout : login}
                  className="hover:bg-[#e6dff1] flex items-center gap-1 mr-6 px-3 py-1 rounded"
                  title={
                    isAuthenticated
                      ? `Cerrar sesión (${user?.email})`
                      : "Iniciar sesión con Google"
                  }
                >
                  <User className="h-7 w-7 text-[#7b5ca2]" />
                  <span className="text-[#7b5ca2] select-none text-sm">
                    {isAuthenticated ? "Cerrar sesión" : "Ingresá"}
                  </span>
                </Button>

                {/* Cart Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-[#e6dff1]"
                  onClick={handleCartClick}
                  title={
                    isAuthenticated ? "Ver carrito" : "Ingresá para ver carrito"
                  }
                >
                  <ShoppingCart className="h-5 w-5 text-[#7b5ca2]" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#665ca2] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Barra inferior (mismo estilo que los títulos) */}
        <div className="bg-[#FAFCEF] flex justify-center items-center gap-8 py-3 text-[17px] text-[#7b5ca2] font-[var(--font-love-story)] tracking-wide">
          {bottomLinks.map((link) => (
            <button
              key={link.label}
              className="transition-all duration-200 transform hover:scale-105 hover:text-[#4e3f73] cursor-pointer"
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;

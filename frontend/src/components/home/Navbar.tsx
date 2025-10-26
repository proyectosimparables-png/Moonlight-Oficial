"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ShoppingCart, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
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

  const handleCartClick = () => {
    if (isAuthenticated) {
      router.push("/cart");
    } else {
      router.push("/auth/login");
    }
  };

  return (
    <>
      <TopBanner />

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

              {/* Logo */}
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

                {/* Login */}
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

                {/* Cart */}
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

        {/* Barra inferior con dropdowns */}
        <div className="bg-[#FAFCEF] flex justify-center items-center gap-8 py-3 text-[17px] text-[#7b5ca2] font-[var(--font-love-story)] tracking-wide">
          {/* Inicio */}
          <button
            onClick={() => router.push("/")}
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
          >
            Inicio
          </button>

          {/* Productos */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-105">
                Productos <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2]">
              <DropdownMenu.Item className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer">
                Guía de Talles
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />
              {[
                "Bangtan Bags",
                "Bangtan Home",
                "Bangtan Limited Edition",
                "Indumentaria",
                "Lo más nuevo",
                "Los más elegidos",
                "Accesorios",
                "Outlet",
              ].map((section) => (
                <DropdownMenu.Item
                  key={section}
                  className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
                >
                  {section}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Quienes Somos */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-105">
                ¿Quiénes Somos? <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2]">
              <DropdownMenu.Item className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer">
                Contacto
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          {/* Políticas de compra */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-105">
                Políticas de Compra <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2]">
              <DropdownMenu.Item className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer">
                Cómo Comprar
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <button className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105">
            Preguntas Frecuentes
          </button>

          <button className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105">
            Mayoristas
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;

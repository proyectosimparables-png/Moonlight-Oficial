"use client";

import Image from "next/image";
import { useState } from "react";
import { Menu, Search, ShoppingCart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { useAuth } from "@/hooks/useAuth"; // IMPORTA TU HOOK DE AUTH

const TopBanner = () => {
  const text =
    "3 CUOTAS SIN INTERÉS TODOS LOS DÍAS! 💳  |  10% DE DESCUENTO POR TRANSFERENCIA BANCARIA.  ";

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
  const [cartCount] = useState(3);
  const { isAuthenticated, login, logout, user } = useAuth(); // usa el hook

  const menuItems = [
    "Productos",
    "¿Quiénes somos?",
    "Política de compra",
    "Preguntas frecuentes",
    "¿Cómo comprar?",
    "Guía de talles",
    "Mayoristas",
    "Contacto",
  ];

  return (
    <>
      <TopBanner />
      <nav className="sticky top-0 z-50 bg-[#FAFCEF] border-b border-[#ddd] backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Left: Menu Dropdown */}
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-[#e6dff1]"
                  >
                    <Menu className="h-5 w-5 text-[#7b5ca2]" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-56 bg-white shadow-md border border-[#ddd]"
                >
                  {menuItems.map((item) => (
                    <DropdownMenuItem
                      key={item}
                      className="cursor-pointer text-sm text-[#7b5ca2] hover:bg-[#f5f0fa]"
                    >
                      {item}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search - Hidden on mobile */}
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
            </div>

            {/* Center: Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Image
                src="/moonlight.jpg"
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

              <Button
                variant="ghost"
                size="icon"
                onClick={isAuthenticated ? logout : login}
                className="hover:bg-[#e6dff1]"
                title={
                  isAuthenticated
                    ? `Cerrar sesión (${user?.email})`
                    : "Iniciar sesión con Google"
                }
              >
                <User className="h-7 w-7 text-[#7b5ca2]" /> {/* Icono más grande */}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-[#e6dff1]"
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
    </>
  );
};

export default Navbar;

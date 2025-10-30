"use client";
import Image from "next/image";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthButton } from "./AuthButton";
import { CartButton } from "./CartButton";
import { SearchInput } from "./SearchInput";

const productSections = [
  "Bangtan Bags",
  "Bangtan Home",
  "Bangtan Limited Edition",
  "Indumentaria",
  "Lo más nuevo",
  "Los más elegidos",
  "Accesorios",
  "Outlet",
];

export const NavbarMobile = () => {
  const router = useRouter();

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Sheet */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Abrir menú">
              <svg
                className="h-6 w-6 text-[#7b5ca2]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SearchInput placeholder="Buscar productos..." />
            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={() => router.push("/")}
                className="text-[#7b5ca2] text-lg font-medium"
              >
                Inicio
              </button>
              {productSections.map((section) => (
                <button
                  key={section}
                  className="text-[#7b5ca2] text-lg font-medium"
                >
                  {section}
                </button>
              ))}
              <button className="text-[#7b5ca2] text-lg font-medium">
                ¿Quiénes Somos?
              </button>
              <button className="text-[#7b5ca2] text-lg font-medium">
                Políticas de Compra
              </button>
              <button className="text-[#7b5ca2] text-lg font-medium">
                Preguntas Frecuentes
              </button>
              <button className="text-[#7b5ca2] text-lg font-medium">
                Mayoristas
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <Image
          src="/moonlight.png"
          alt="Moonlight Logo"
          width={120}
          height={30}
          priority
        />

        {/* Right: Auth & Cart */}
        <div className="flex items-center gap-2">
          <AuthButton />
          <CartButton />
        </div>
      </div>
    </div>
  );
};

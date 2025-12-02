"use client";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AuthButton } from "./AuthButton";
import { CartButton } from "./CartButton";
import { SearchInput } from "../search/SearchInput";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";

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

const bottomSections = [
  { label: "¿Quiénes Somos?", path: "/cliente/quienes-somos" },
  { label: "Políticas de Compra", path: "/cliente/politicas-de-compras" },
  { label: "Preguntas Frecuentes", path: "/cliente/preguntas-frecuentes" },
  { label: "Cómo Comprar", path: "/cliente/como-comprar" },
  { label: "Mayoristas", path: "/cliente/mayoristas" },
  { label: "Guía de Talles", path: "/cliente/guia-de-talles" },
  { label: "Cuentanos tu experiencia Moonglight", path: "/cliente/comentar" },
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
            <SheetHeader>
              <SheetTitle className="text-xl font-bold text-[#7b5ca2]">
                Menú
              </SheetTitle>
            </SheetHeader>

            {/* Buscador */}
            <SearchInput placeholder="Buscar productos..." />

            {/* Productos Dropdown */}
            <div className="mt-4">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <Button className="w-full justify-between bg-[#7b5ca2] text-white py-2 px-4 rounded-md shadow-md hover:scale-105 transition-transform">
                    Productos <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Content className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] mt-2">
                  {productSections.map((section) => {
                    const slug = section
                      .toLowerCase()
                      .normalize("NFD")
                      .replace(/[\u0300-\u036f]/g, "")
                      .replace(/\s+/g, "-");

                    return (
                      <DropdownMenu.Item
                        key={section}
                        className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
                        onClick={() => router.push(`/seccion/${slug}`)}
                      >
                        {section}
                      </DropdownMenu.Item>
                    );
                  })}
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </div>

            {/* Links inferiores */}
            <div className="mt-6 flex flex-col gap-3">
              {bottomSections.map((section) => (
                <Button
                  key={section.label}
                  onClick={() => router.push(section.path)}
                  className="bg-[#4e3f73] text-white font-semibold py-2 rounded-lg shadow-md hover:shadow-xl hover:scale-105 transition-all"
                >
                  {section.label}
                </Button>
              ))}
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

        {/* Botones de usuario y carrito */}
        <div className="flex items-center gap-2">
          <AuthButton />
          <CartButton />
        </div>
      </div>

      {/* Buscador inferior */}
      <div className="px-4 pb-3">
        <SearchInput placeholder="Buscar productos..." />
      </div>
    </div>
  );
};

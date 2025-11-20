"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CartButton } from "./CartButton";
import { AuthButton } from "./AuthButton";
import { SearchInput } from "../search/SearchInput";

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

export const NavbarDesktop = () => {
  const router = useRouter();

  const irAComentar = () => {
    router.push("/cliente/comentar");
  };

  return (
    <>
      <div className="hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 relative">
            {/* Search */}
            <div className="hidden md:flex items-center gap-2">
              <SearchInput placeholder="Buscar productos..." />
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

            {/* Right: Auth & Cart */}
            <div className="flex items-center gap-2">
              <AuthButton />
              <CartButton />
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="bg-[#FAFCEF] justify-center items-center gap-8 py-3 text-[17px] text-[#7b5ca2] font-[var(--font-love-story)] tracking-wide flex">
          <button
            onClick={() => router.push("/")}
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
          >
            Inicio
          </button>

          {/* Dropdown de Productos */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-105">
                Productos <ChevronDown className="ml-1 h-4 w-4" />
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Content className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2]">
              {productSections.map((section) => {
                // Convertimos el nombre en un slug (ej: "Bangtan Bags" → "bangtan-bags")
                const slug = section
                  .toLowerCase()
                  .normalize("NFD") // elimina acentos
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/\s+/g, "-"); // reemplaza espacios por guiones

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

          {/* Otras secciones */}
          <button
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
            onClick={() => router.push("/cliente/quienes-somos")}
          >
            ¿Quiénes Somos?
          </button>

          <button
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
            onClick={() => router.push("/cliente/politicas-de-compras")}
          >
            Políticas de Compra
          </button>

          <button
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
            onClick={() => router.push("/cliente/preguntas-frecuentes")}
          >
            Preguntas Frecuentes
          </button>

          <button
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
            onClick={() => router.push("/cliente/como-comprar")}
          >
            Como Comprar
          </button>

          <button
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
            onClick={() => router.push("/cliente/mayoristas")}
          >
            Mayoristas
          </button>

          <button
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
            onClick={() => router.push("/cliente/guia-de-talles")}
          >
            Guia de Talles
          </button>

          <button
            onClick={irAComentar}
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
          >
            Cuentanos tu experiencia Moonglight
          </button>
        </div>
      </div>
    </>
  );
};

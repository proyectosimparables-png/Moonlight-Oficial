"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CartButton } from "./CartButton";
import { AuthButton } from "./AuthButton";
import { SearchInput } from "../search/SearchInput";
import { useState } from "react";

export const NavbarDesktop = () => {
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Estados para controlar el cierre manual de los menús principales
  const [productsOpen, setProductsOpen] = useState(false);
  const [howToBuyOpen, setHowToBuyOpen] = useState(false);

  const handleMouseEnter = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: true }));
  };

  const handleMouseLeave = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: false }));
  };

  // Función para cerrar todos los dropdowns al hacer click
  const closeAll = () => {
    setProductsOpen(false);
    setHowToBuyOpen(false);
    setOpenMenus({});
  };

  return (
    <div className="hidden md:block">
      {/* Parte superior */}
      <div className="bg-[#FAFCEF]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 relative">
            <div className="hidden md:flex items-center gap-2">
              <SearchInput placeholder="Buscar productos..." />
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/">
                <Image
                  src="/moonlight.png"
                  alt="Moonlight Logo"
                  width={140}
                  height={40}
                  priority
                  className="cursor-pointer"
                />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <AuthButton />
              <CartButton />
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior de navegación */}
      <div className="bg-[#FAFCEF] justify-center items-center gap-6 py-3 text-[17px] text-[#7b5ca2] font-[var(--font-love-story)] tracking-wide flex">
        {/* DROPDOWN PRODUCTOS */}
        <DropdownMenu.Root open={productsOpen} onOpenChange={setProductsOpen}>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-105 outline-none">
              Productos <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px] z-50 animate-in fade-in zoom-in-95 duration-200"
            sideOffset={5}
          >
            <DropdownMenu.Item className="outline-none" onClick={closeAll}>
              <Link
                href="/productos"
                className="flex w-full px-4 py-2 hover:bg-[#f3eefb] font-semibold"
              >
                Ver todos los productos
              </Link>
            </DropdownMenu.Item>

            {/* --- INDUMENTARIA --- */}
            <DropdownMenu.Sub
              open={openMenus["indumentaria"]}
              onOpenChange={(open) =>
                setOpenMenus((p) => ({ ...p, indumentaria: open }))
              }
            >
              <div
                onMouseEnter={() => handleMouseEnter("indumentaria")}
                onMouseLeave={() => handleMouseLeave("indumentaria")}
              >
                <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none">
                  Indumentaria{" "}
                  <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                </DropdownMenu.SubTrigger>

                <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px] animate-in fade-in slide-in-from-left-1">
                  {/* REMERAS */}
                  <DropdownMenu.Sub
                    open={openMenus["remeras"]}
                    onOpenChange={(open) =>
                      setOpenMenus((p) => ({ ...p, remeras: open }))
                    }
                  >
                    <div
                      onMouseEnter={() => handleMouseEnter("remeras")}
                      onMouseLeave={() => handleMouseLeave("remeras")}
                    >
                      <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none">
                        Remeras{" "}
                        <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px]">
                        {/* BTS en Remeras */}
                        <DropdownMenu.Sub
                          open={openMenus["bts-rem"]}
                          onOpenChange={(open) =>
                            setOpenMenus((p) => ({ ...p, "bts-rem": open }))
                          }
                        >
                          <div
                            onMouseEnter={() => handleMouseEnter("bts-rem")}
                            onMouseLeave={() => handleMouseLeave("bts-rem")}
                          >
                            <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none">
                              BTS{" "}
                              <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                            </DropdownMenu.SubTrigger>
                            <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[180px]">
                              {[
                                "RM",
                                "Taehyung",
                                "Jungkook",
                                "J-Hope",
                                "Jimin",
                                "Jin",
                                "Suga",
                                "Rap Line",
                                "Vocal Line",
                              ].map((m) => (
                                <DropdownMenu.Item
                                  key={m}
                                  className="outline-none"
                                  onClick={closeAll}
                                >
                                  <Link
                                    href={`/productos/indumentaria/remeras/bts/${m.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                                  >
                                    {m}
                                  </Link>
                                </DropdownMenu.Item>
                              ))}
                              <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                              <DropdownMenu.Item
                                className="outline-none font-bold"
                                onClick={closeAll}
                              >
                                <Link
                                  href="/productos/indumentaria/remeras/bts"
                                  className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                                >
                                  Ver todo BTS Remeras
                                </Link>
                              </DropdownMenu.Item>
                            </DropdownMenu.SubContent>
                          </div>
                        </DropdownMenu.Sub>

                        {[
                          "Stray Kids",
                          "The Rose",
                          "Jonas Brothers",
                          "New Jeans",
                        ].map((g) => (
                          <DropdownMenu.Item
                            key={g}
                            className="outline-none"
                            onClick={closeAll}
                          >
                            <Link
                              href={`/productos/indumentaria/remeras/${g.toLowerCase().replace(/\s+/g, "-")}`}
                              className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                            >
                              {g}
                            </Link>
                          </DropdownMenu.Item>
                        ))}
                        <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                        <DropdownMenu.Item
                          className="outline-none font-bold"
                          onClick={closeAll}
                        >
                          <Link
                            href="/productos/indumentaria/remeras"
                            className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                          >
                            Ver todo en Remeras
                          </Link>
                        </DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </div>
                  </DropdownMenu.Sub>

                  {/* ABRIGOS */}
                  <DropdownMenu.Sub
                    open={openMenus["abrigos"]}
                    onOpenChange={(open) =>
                      setOpenMenus((p) => ({ ...p, abrigos: open }))
                    }
                  >
                    <div
                      onMouseEnter={() => handleMouseEnter("abrigos")}
                      onMouseLeave={() => handleMouseLeave("abrigos")}
                    >
                      <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none">
                        Abrigos{" "}
                        <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px]">
                        {["Hoodies", "Buzos"].map((type) => (
                          <DropdownMenu.Sub
                            key={type}
                            open={openMenus[type]}
                            onOpenChange={(open) =>
                              setOpenMenus((p) => ({ ...p, [type]: open }))
                            }
                          >
                            <div
                              onMouseEnter={() => handleMouseEnter(type)}
                              onMouseLeave={() => handleMouseLeave(type)}
                            >
                              <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none">
                                {type}{" "}
                                <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                              </DropdownMenu.SubTrigger>
                              <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[180px]">
                                {["BTS", "Stray Kids"].map((g) => (
                                  <DropdownMenu.Item
                                    key={g}
                                    className="outline-none"
                                    onClick={closeAll}
                                  >
                                    <Link
                                      href={`/productos/indumentaria/abrigos/${type.toLowerCase()}/${g.toLowerCase().replace(/\s+/g, "-")}`}
                                      className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                                    >
                                      {g}
                                    </Link>
                                  </DropdownMenu.Item>
                                ))}
                                <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                                <DropdownMenu.Item
                                  className="outline-none font-bold"
                                  onClick={closeAll}
                                >
                                  <Link
                                    href={`/productos/indumentaria/abrigos/${type.toLowerCase()}`}
                                    className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                                  >
                                    Ver todo en {type}
                                  </Link>
                                </DropdownMenu.Item>
                              </DropdownMenu.SubContent>
                            </div>
                          </DropdownMenu.Sub>
                        ))}
                        <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                        <DropdownMenu.Item
                          className="outline-none font-bold"
                          onClick={closeAll}
                        >
                          <Link
                            href="/productos/indumentaria/abrigos"
                            className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                          >
                            Ver todo en Abrigos
                          </Link>
                        </DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </div>
                  </DropdownMenu.Sub>
                </DropdownMenu.SubContent>
              </div>
            </DropdownMenu.Sub>

            {/* BANGTAN LIMITED */}
            <DropdownMenu.Sub
              open={openMenus["bangtan"]}
              onOpenChange={(open) =>
                setOpenMenus((p) => ({ ...p, bangtan: open }))
              }
            >
              <div
                onMouseEnter={() => handleMouseEnter("bangtan")}
                onMouseLeave={() => handleMouseLeave("bangtan")}
              >
                <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none">
                  Bangtan Limited Edition{" "}
                  <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px]">
                  {["Accesorios", "Bangtan Bags", "Bangtan Home"].map(
                    (item) => (
                      <DropdownMenu.Item
                        key={item}
                        className="outline-none"
                        onClick={closeAll}
                      >
                        <Link
                          href={`/productos/bangtan-limited-edition/${item.toLowerCase().replace(/\s+/g, "-")}`}
                          className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                        >
                          {item}
                        </Link>
                      </DropdownMenu.Item>
                    ),
                  )}
                </DropdownMenu.SubContent>
              </div>
            </DropdownMenu.Sub>

            <DropdownMenu.Item className="outline-none" onClick={closeAll}>
              <Link
                href="/productos/gift-cards"
                className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
              >
                Gift Cards
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        {/* BOTONES DIRECTOS */}
        <Link
          href="/quienes-somos"
          className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
        >
          ¿Quiénes Somos?
        </Link>

        <DropdownMenu.Root open={howToBuyOpen} onOpenChange={setHowToBuyOpen}>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-105 outline-none">
              ¿Cómo comprar? <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[180px] z-50 animate-in fade-in zoom-in-95 duration-200">
            {[
              { l: "Guía de Compra", h: "/como-comprar" },
              { l: "Políticas de Compra", h: "/politicas-de-compras" },
              { l: "Guía de Talles", h: "/guia-de-talles" },
              { l: "Mayoristas", h: "/mayoristas" },
              { l: "Preguntas Frecuentes", h: "/preguntas-frecuentes" },
            ].map((i) => (
              <DropdownMenu.Item
                key={i.h}
                className="outline-none"
                onClick={closeAll}
              >
                <Link
                  href={i.h}
                  className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                >
                  {i.l}
                </Link>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <Link
          href="/comentar"
          className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
        >
          Experiencia Moonlight
        </Link>

        <Link
          href="/army-club"
          className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
        >
          Army Club
        </Link>

        <Link
          href="/calendario-lunar"
          className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
        >
          Calendario Lunar
        </Link>
      </div>
    </div>
  );
};

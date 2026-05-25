"use client";

import Image from "next/image";
import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CartButton } from "./CartButton";
import { AuthButton } from "./AuthButton";
import { SearchInput } from "../search/SearchInput";
import { useState, useEffect } from "react";

export const NavbarDesktop = () => {
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [productsOpen, setProductsOpen] = useState(false);
  const [howToBuyOpen, setHowToBuyOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseEnter = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: true }));
  };

  const handleMouseLeave = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: false }));
  };

  const closeAll = () => {
    setProductsOpen(false);
    setHowToBuyOpen(false);
    setOpenMenus({});
  };

  if (!mounted) {
    return <div className="hidden md:block w-full h-36 bg-[#fafcef]/80" />;
  }

  return (
    <div className="hidden md:block w-full relative z-50">
      {/* PARTE SUPERIOR */}
      <div className="bg-[#fafcef]/80 backdrop-blur-md border-b border-white/20 relative z-30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-24 relative">
            <div className="hidden md:flex items-center gap-2">
              <SearchInput />
            </div>

            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/">
                <Image
                  src="/moonlight.png"
                  alt="Moonlight Logo"
                  width={160}
                  height={50}
                  priority
                  className="cursor-pointer hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <AuthButton />
              <CartButton />
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE NAVEGACIÓN */}
      <nav className="bg-[#fafcef]/90 backdrop-blur-sm justify-center items-center gap-8 py-3 text-[17px] text-[#7b5ca2] font-love-ya tracking-wide flex shadow-sm relative z-20">
        <DropdownMenu.Root open={productsOpen} onOpenChange={setProductsOpen}>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-110 outline-none">
              Productos <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            className="bg-[#fafcef] backdrop-blur-xl shadow-xl rounded-md py-2 text-sm text-[#7b5ca2] min-w-64 z-60 animate-in fade-in zoom-in-95 duration-200 border border-purple-50"
            sideOffset={8}
          >
            <DropdownMenu.Item className="outline-none" onClick={closeAll}>
              <Link
                href="/productos"
                className="flex w-full px-4 py-2 hover:bg-[#f3eefb] font-bold text-[#4e3f73]"
              >
                Ver todos los productos
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Separator className="h-px bg-purple-100/50 my-1" />

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
                <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none font-medium text-[#4e3f73]">
                  Indumentaria{" "}
                  <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent className="bg-[#fafcef] shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-56 border border-purple-50">
                  {/* ✨ AGREGADO: Ver todo en Indumentaria */}
                  <DropdownMenu.Item
                    className="outline-none"
                    onClick={closeAll}
                  >
                    <Link
                      href="/indumentaria"
                      className="flex w-full px-4 py-2 hover:bg-[#f3eefb] font-bold text-[#4e3f73]"
                    >
                      Ver todo en Indumentaria
                    </Link>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px bg-purple-50 my-1" />

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
                      <DropdownMenu.SubContent className="bg-[#fafcef] shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-52 border border-purple-50">
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
                            <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none font-semibold">
                              BTS{" "}
                              <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                            </DropdownMenu.SubTrigger>
                            <DropdownMenu.SubContent className="bg-[#fafcef] shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-44 border border-purple-50">
                              <DropdownMenu.Item
                                className="outline-none"
                                onClick={closeAll}
                              >
                                <Link
                                  href="/indumentaria/remeras/bts"
                                  className="flex w-full px-4 py-2 hover:bg-[#f3eefb] font-bold"
                                >
                                  Ver todo BTS
                                </Link>
                              </DropdownMenu.Item>
                              <DropdownMenu.Separator className="h-px bg-purple-50 my-1" />
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
                                    href={`/indumentaria/remeras/bts/${m.toLowerCase().replace(/\s+/g, "-")}`}
                                    className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                                  >
                                    {m}
                                  </Link>
                                </DropdownMenu.Item>
                              ))}
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
                              href={`/indumentaria/remeras/${g.toLowerCase().replace(/\s+/g, "-")}`}
                              className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                            >
                              {g}
                            </Link>
                          </DropdownMenu.Item>
                        ))}
                        <DropdownMenu.Separator className="h-px bg-purple-100/50 my-1" />
                        <DropdownMenu.Item
                          className="outline-none"
                          onClick={closeAll}
                        >
                          <Link
                            href="/indumentaria/remeras"
                            className="flex w-full px-4 py-2 hover:bg-[#f3eefb] font-bold italic"
                          >
                            Ver todas las Remeras
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
                      <DropdownMenu.SubContent className="bg-[#fafcef] shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-52 border border-purple-50">
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
                              <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none font-medium">
                                {type}{" "}
                                <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                              </DropdownMenu.SubTrigger>
                              <DropdownMenu.SubContent className="bg-[#fafcef] shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-44 border border-purple-50">
                                {["BTS", "Stray Kids"].map((g) => (
                                  <DropdownMenu.Item
                                    key={g}
                                    className="outline-none"
                                    onClick={closeAll}
                                  >
                                    <Link
                                      href={`/indumentaria/abrigos/${type.toLowerCase()}/${g.toLowerCase().replace(/\s+/g, "-")}`}
                                      className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                                    >
                                      {g}
                                    </Link>
                                  </DropdownMenu.Item>
                                ))}
                                <DropdownMenu.Separator className="h-px bg-purple-50 my-1" />
                                <DropdownMenu.Item
                                  className="outline-none"
                                  onClick={closeAll}
                                >
                                  <Link
                                    href={`/indumentaria/abrigos/${type.toLowerCase()}`}
                                    className="flex w-full px-4 py-2 hover:bg-[#f3eefb] font-bold"
                                  >
                                    Ver todos los {type}
                                  </Link>
                                </DropdownMenu.Item>
                              </DropdownMenu.SubContent>
                            </div>
                          </DropdownMenu.Sub>
                        ))}
                        <DropdownMenu.Separator className="h-px bg-purple-100/50 my-1" />
                        <DropdownMenu.Item
                          className="outline-none"
                          onClick={closeAll}
                        >
                          <Link
                            href="/indumentaria/abrigos"
                            className="flex w-full px-4 py-2 hover:bg-[#f3eefb] font-bold italic"
                          >
                            Ver todos los Abrigos
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
                <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center outline-none font-semibold text-[#4e3f73]">
                  Bangtan Limited Edition{" "}
                  <ChevronDown className="ml-2 h-3 w-3 -rotate-90" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent className="bg-[#fafcef] shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-52 border border-purple-50">
                  {["Accesorios", "Bangtan Bags", "Bangtan Home"].map(
                    (item) => (
                      <DropdownMenu.Item
                        key={item}
                        className="outline-none"
                        onClick={closeAll}
                      >
                        <Link
                          href={`/bangtan-limited-edition/${item.toLowerCase().replace(/\s+/g, "-")}`}
                          className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
                        >
                          {item}
                        </Link>
                      </DropdownMenu.Item>
                    ),
                  )}
                  <DropdownMenu.Separator className="h-px bg-purple-100/50 my-1" />
                  <DropdownMenu.Item
                    className="outline-none"
                    onClick={closeAll}
                  >
                    <Link
                      href="/bangtan-limited-edition"
                      className="flex w-full px-4 py-2 hover:bg-[#f3eefb] font-bold"
                    >
                      Ver todo Limited Edition
                    </Link>
                  </DropdownMenu.Item>
                </DropdownMenu.SubContent>
              </div>
            </DropdownMenu.Sub>

            <DropdownMenu.Item className="outline-none" onClick={closeAll}>
              <Link
                href="/gift-cards"
                className="flex w-full px-4 py-2 hover:bg-[#f3eefb]"
              >
                Gift Cards
              </Link>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        {/* Links directos */}
        {[
          { n: "¿Quiénes Somos?", h: "/quienes-somos" },
          { n: "Experiencia Moonlight", h: "/comentar" },
          { n: "Army Club", h: "/army-club" },
          { n: "Calendario Lunar", h: "/calendario-lunar" },
        ].map((link) => (
          <Link
            key={link.h}
            href={link.h}
            className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-110"
          >
            {link.n}
          </Link>
        ))}

        {/* Cómo comprar */}
        <DropdownMenu.Root open={howToBuyOpen} onOpenChange={setHowToBuyOpen}>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-110 outline-none">
              ¿Cómo comprar? <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="bg-[#fafcef] shadow-xl rounded-md py-2 text-sm text-[#7b5ca2] min-w-52 z-50 border border-purple-50">
            {[
              { l: "Guía de Compra", h: "/como-comprar" },
              { l: "Políticas", h: "/politicas-de-compras" },
              { l: "Guía de Talles", h: "/guia-de-talles" },
              { l: "Mayoristas", h: "/mayoristas" },
              { l: "Preguntas", h: "/preguntas-frecuentes" },
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
      </nav>
    </div>
  );
};

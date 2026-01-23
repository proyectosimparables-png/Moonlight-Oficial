"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CartButton } from "./CartButton";
import { AuthButton } from "./AuthButton";
import { SearchInput } from "../search/SearchInput";
import { useState } from "react";

export const NavbarDesktop = () => {
  const router = useRouter();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const handleMouseEnter = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: true }));
  };

  const handleMouseLeave = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: false }));
  };

  const irAComentar = () => {
    router.push("/comentar");
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
              <Image
                src="/moonlight.png"
                alt="Moonlight Logo"
                width={140}
                height={40}
                priority
                style={{ cursor: "pointer" }}
                onClick={() => router.push("/")}
              />
            </div>
            <div className="flex items-center gap-2">
              <AuthButton />
              <CartButton />
            </div>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="bg-[#FAFCEF] justify-center items-center gap-6 py-3 text-[17px] text-[#7b5ca2] font-[var(--font-love-story)] tracking-wide flex">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-105">
              Productos <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px] z-50"
            sideOffset={5}
          >
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer font-semibold outline-none"
              onClick={() => router.push("/productos")}
            >
              Ver todos los productos
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

                <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px]">
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
                                  className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer outline-none"
                                  onClick={() =>
                                    router.push(
                                      `/productos/indumentaria/remeras/bts/${m.toLowerCase().replace(/\s+/g, "-")}`,
                                    )
                                  }
                                >
                                  {m}
                                </DropdownMenu.Item>
                              ))}
                              <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                              <DropdownMenu.Item
                                className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer font-bold outline-none"
                                onClick={() =>
                                  router.push(
                                    "/productos/indumentaria/remeras/bts",
                                  )
                                }
                              >
                                Ver todo BTS Remeras
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
                            className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer outline-none"
                            onClick={() =>
                              router.push(
                                `/productos/indumentaria/remeras/${g.toLowerCase().replace(/\s+/g, "-")}`,
                              )
                            }
                          >
                            {g}
                          </DropdownMenu.Item>
                        ))}
                        <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                        <DropdownMenu.Item
                          className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer font-bold outline-none"
                          onClick={() =>
                            router.push("/productos/indumentaria/remeras")
                          }
                        >
                          Ver todo en Remeras
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
                                    className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer outline-none"
                                    onClick={() =>
                                      router.push(
                                        `/productos/indumentaria/abrigos/${type.toLowerCase()}/${g.toLowerCase().replace(/\s+/g, "-")}`,
                                      )
                                    }
                                  >
                                    {g}
                                  </DropdownMenu.Item>
                                ))}
                                <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                                <DropdownMenu.Item
                                  className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer font-bold outline-none"
                                  onClick={() =>
                                    router.push(
                                      `/productos/indumentaria/abrigos/${type.toLowerCase()}`,
                                    )
                                  }
                                >
                                  Ver todo en {type}
                                </DropdownMenu.Item>
                              </DropdownMenu.SubContent>
                            </div>
                          </DropdownMenu.Sub>
                        ))}
                        <DropdownMenu.Separator className="h-px bg-gray-100 my-1" />
                        <DropdownMenu.Item
                          className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer font-bold outline-none"
                          onClick={() =>
                            router.push("/productos/indumentaria/abrigos")
                          }
                        >
                          Ver todo en Abrigos
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
                        className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer outline-none"
                        onClick={() =>
                          router.push(
                            `/productos/bangtan-limited-edition/${item.toLowerCase().replace(/\s+/g, "-")}`,
                          )
                        }
                      >
                        {item}
                      </DropdownMenu.Item>
                    ),
                  )}
                </DropdownMenu.SubContent>
              </div>
            </DropdownMenu.Sub>

            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer outline-none"
              onClick={() => router.push("/productos/gift-cards")}
            >
              Gift Cards
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        {/* BOTONES FINALES */}
        <button
          onClick={() => router.push("/quienes-somos")}
          className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
        >
          ¿Quiénes Somos?
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-105">
              ¿Cómo comprar? <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[180px] z-50">
            {[
              { l: "Guía de Compra", h: "/como-comprar" },
              { l: "Políticas de Compra", h: "/politicas-de-compras" },
              { l: "Guía de Talles", h: "/guia-de-talles" },
              { l: "Mayoristas", h: "/mayoristas" },
              { l: "Preguntas Frecuentes", h: "/preguntas-frecuentes" },
            ].map((i) => (
              <DropdownMenu.Item
                key={i.h}
                className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer outline-none"
                onClick={() => router.push(i.h)}
              >
                {i.l}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <button
          onClick={irAComentar}
          className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
        >
          Experiencia Moonlight
        </button>
        <button
          onClick={irAComentar}
          className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
        >
          Army Club
        </button>
        <button
          onClick={irAComentar}
          className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
        >
          Calendario Lunar
        </button>
      </div>
    </div>
  );
};

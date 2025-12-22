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
    router.push("/cliente/comentar");
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
        {/* Dropdown Productos */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center hover:text-[#4e3f73] transition-all duration-200 hover:scale-105">
              Productos <ChevronDown className="ml-1 h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px]"
            sideOffset={5}
          >
            {/* Ver todos los productos */}
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
              onClick={() => router.push("/productos")}
            >
              Ver todos los productos
            </DropdownMenu.Item>

            {/* Indumentaria */}
            <DropdownMenu.Sub
              open={openMenus["indumentaria"]}
              onOpenChange={() => {}}
            >
              <div
                onMouseEnter={() => handleMouseEnter("indumentaria")}
                onMouseLeave={() => handleMouseLeave("indumentaria")}
              >
                <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center">
                  Indumentaria <ChevronDown className="ml-2 h-3 w-3 inline" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px]">
                  {/* Remeras */}
                  <DropdownMenu.Sub
                    open={openMenus["remeras"]}
                    onOpenChange={() => {}}
                  >
                    <div
                      onMouseEnter={() => handleMouseEnter("remeras")}
                      onMouseLeave={() => handleMouseLeave("remeras")}
                    >
                      <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center">
                        Remeras <ChevronDown className="ml-2 h-3 w-3 inline" />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px]">
                        {/* BTS */}
                        <DropdownMenu.Sub
                          open={openMenus["bts"]}
                          onOpenChange={() => {}}
                        >
                          <div
                            onMouseEnter={() => handleMouseEnter("bts")}
                            onMouseLeave={() => handleMouseLeave("bts")}
                          >
                            <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center">
                              BTS{" "}
                              <ChevronDown className="ml-2 h-3 w-3 inline" />
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
                              ].map((member) => (
                                <DropdownMenu.Item
                                  key={member}
                                  className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
                                  onClick={() =>
                                    router.push(
                                      `/productos/bts/${member.toLowerCase()}`
                                    )
                                  }
                                >
                                  {member}
                                </DropdownMenu.Item>
                              ))}
                            </DropdownMenu.SubContent>
                          </div>
                        </DropdownMenu.Sub>

                        {/* Otros grupos */}
                        {[
                          "Stray Kids",
                          "The Rose",
                          "Jonas Brothers",
                          "New Jeans",
                        ].map((group) => (
                          <DropdownMenu.Item
                            key={group}
                            className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/productos/remeras/${group
                                  .toLowerCase()
                                  .replace(/\s+/g, "-")}`
                              )
                            }
                          >
                            {group}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.SubContent>
                    </div>
                  </DropdownMenu.Sub>

                  {/* Abrigos */}
                  <DropdownMenu.Sub
                    open={openMenus["abrigos"]}
                    onOpenChange={() => {}}
                  >
                    <div
                      onMouseEnter={() => handleMouseEnter("abrigos")}
                      onMouseLeave={() => handleMouseLeave("abrigos")}
                    >
                      <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center">
                        Abrigos <ChevronDown className="ml-2 h-3 w-3 inline" />
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px]">
                        {["Hoodies", "Buzos"].map((type) => (
                          <DropdownMenu.Sub key={type}>
                            <div
                              onMouseEnter={() => handleMouseEnter(type)}
                              onMouseLeave={() => handleMouseLeave(type)}
                            >
                              <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center">
                                {type}{" "}
                                <ChevronDown className="ml-2 h-3 w-3 inline" />
                              </DropdownMenu.SubTrigger>
                              <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[180px]">
                                {["BTS", "Stray Kids"].map((group) => (
                                  <DropdownMenu.Item
                                    key={group}
                                    className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
                                    onClick={() =>
                                      router.push(
                                        `/productos/abrigos/${type.toLowerCase()}/${group
                                          .toLowerCase()
                                          .replace(/\s+/g, "-")}`
                                      )
                                    }
                                  >
                                    {group}
                                  </DropdownMenu.Item>
                                ))}
                              </DropdownMenu.SubContent>
                            </div>
                          </DropdownMenu.Sub>
                        ))}
                      </DropdownMenu.SubContent>
                    </div>
                  </DropdownMenu.Sub>
                </DropdownMenu.SubContent>
              </div>
            </DropdownMenu.Sub>

            {/* Bangtan Limited Edition */}
            <DropdownMenu.Sub
              open={openMenus["bangtan"]}
              onOpenChange={() => {}}
            >
              <div
                onMouseEnter={() => handleMouseEnter("bangtan")}
                onMouseLeave={() => handleMouseLeave("bangtan")}
              >
                <DropdownMenu.SubTrigger className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer flex justify-between items-center">
                  Bangtan Limited Edition{" "}
                  <ChevronDown className="ml-2 h-3 w-3 inline" />
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2] min-w-[200px]">
                  {["Accesorios", "Bangtan Bags", "Bangtan Home"].map(
                    (item) => (
                      <DropdownMenu.Item
                        key={item}
                        className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/productos/bangtan-limited/${item
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`
                          )
                        }
                      >
                        {item}
                      </DropdownMenu.Item>
                    )
                  )}
                </DropdownMenu.SubContent>
              </div>
            </DropdownMenu.Sub>

            {/* Gift Cards */}
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
              onClick={() => router.push("/productos/gift-cards")}
            >
              Gift Cards
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        {/* Botones estáticos */}
        <button
          onClick={() => router.push("/cliente/quienes-somos")}
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

          <DropdownMenu.Content className="bg-white shadow-lg rounded-md py-2 text-sm text-[#7b5ca2]">
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
              onClick={() => router.push("/cliente/como-comprar")}
            >
              Guia de Compra
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
              onClick={() => router.push("/cliente/politicas-de-compras")}
            >
              Políticas de Compra
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
              onClick={() => router.push("/cliente/guia-de-talles")}
            >
              Guia de Talles
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
              onClick={() => router.push("/cliente/mayoristas")}
            >
              Mayoristas
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="px-4 py-2 hover:bg-[#f3eefb] cursor-pointer"
              onClick={() => router.push("/cliente/preguntas-frecuentes")}
            >
              Preguntas Frecuentes
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>

        <button
          onClick={irAComentar}
          className="hover:text-[#4e3f73] transition-all duration-200 hover:scale-105"
        >
          Experiencia Moonglight
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

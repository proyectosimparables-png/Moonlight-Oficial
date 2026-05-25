"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ArrowLeft, Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { AuthButton } from "./Auth-Button";
import { CartButton } from "./Cart-Button";
import { SearchInput } from "../search/Search-Input";
import { useState, useEffect } from "react";

interface MenuItem {
  label: string;
  path?: string;
  sub?: MenuItem[];
}

const MENU: MenuItem[] = [
  {
    label: "Productos",
    sub: [
      { label: "Ver todos los productos", path: "/productos" },
      {
        label: "Indumentaria",
        sub: [
          {
            label: "Remeras",
            sub: [
              {
                label: "BTS",
                sub: [
                  {
                    label: "Ver todo BTS",
                    path: "/productos/indumentaria/remeras/bts",
                  },
                  {
                    label: "RM",
                    path: "/productos/indumentaria/remeras/bts/rm",
                  },
                  {
                    label: "Jin",
                    path: "/productos/indumentaria/remeras/bts/jin",
                  },
                  {
                    label: "Suga",
                    path: "/productos/indumentaria/remeras/bts/suga",
                  },
                  {
                    label: "J-Hope",
                    path: "/productos/indumentaria/remeras/bts/j-hope",
                  },
                  {
                    label: "Jimin",
                    path: "/productos/indumentaria/remeras/bts/jimin",
                  },
                  {
                    label: "Taehyung",
                    path: "/productos/indumentaria/remeras/bts/taehyung",
                  },
                  {
                    label: "Jungkook",
                    path: "/productos/indumentaria/remeras/bts/jungkook",
                  },
                  {
                    label: "Rap Line",
                    path: "/productos/indumentaria/remeras/bts/rap-line",
                  },
                  {
                    label: "Vocal Line",
                    path: "/productos/indumentaria/remeras/bts/vocal-line",
                  },
                ],
              },
              {
                label: "Stray Kids",
                path: "/productos/indumentaria/remeras/stray-kids",
              },
              {
                label: "The Rose",
                path: "/productos/indumentaria/remeras/the-rose",
              },
              {
                label: "Jonas Brothers",
                path: "/productos/indumentaria/remeras/jonas-brothers",
              },
              {
                label: "New Jeans",
                path: "/productos/indumentaria/remeras/new-jeans",
              },
              {
                label: "Ver todas las Remeras",
                path: "/productos/indumentaria/remeras",
              },
            ],
          },
          {
            label: "Abrigos",
            sub: [
              {
                label: "Hoodies",
                sub: [
                  {
                    label: "BTS",
                    path: "/productos/indumentaria/abrigos/hoodies/bts",
                  },
                  {
                    label: "Stray Kids",
                    path: "/productos/indumentaria/abrigos/hoodies/stray-kids",
                  },
                  {
                    label: "Ver todos los Hoodies",
                    path: "/productos/indumentaria/abrigos/hoodies",
                  },
                ],
              },
              {
                label: "Buzos",
                sub: [
                  {
                    label: "BTS",
                    path: "/productos/indumentaria/abrigos/buzos/bts",
                  },
                  {
                    label: "Stray Kids",
                    path: "/productos/indumentaria/abrigos/buzos/stray-kids",
                  },
                  {
                    label: "Ver todos los Buzos",
                    path: "/productos/indumentaria/abrigos/buzos",
                  },
                ],
              },
              {
                label: "Ver todos los Abrigos",
                path: "/productos/indumentaria/abrigos",
              },
            ],
          },
        ],
      },
      {
        label: "Bangtan Limited Edition",
        sub: [
          {
            label: "Accesorios",
            path: "/productos/bangtan-limited-edition/accesorios",
          },
          {
            label: "Bangtan Bags",
            path: "/productos/bangtan-limited-edition/bangtan-bags",
          },
          {
            label: "Bangtan Home",
            path: "/productos/bangtan-limited-edition/bangtan-home",
          },
          {
            label: "Ver todo Limited Edition",
            path: "/productos/bangtan-limited-edition",
          },
        ],
      },
      { label: "Gift Cards", path: "/productos/gift-cards" },
    ],
  },
  {
    label: "¿Cómo comprar?",
    sub: [
      { label: "Guía de Compra", path: "/how-to-buy" },
      { label: "Políticas de Compra", path: "/privacy-policy" },
      { label: "Guía de Talles", path: "/size-guide" },
      { label: "Mayoristas", path: "/wholesale" },
      { label: "Preguntas Frecuentes", path: "/faq" },
    ],
  },
  { label: "¿Quiénes Somos?", path: "/about-us" },
  { label: "Experiencia Moonlight", path: "/comment" },
  { label: "Army Club", path: "/army-club" },
  { label: "Calendario Lunar", path: "/calendario-lunar" },
];

export const NavbarMobile = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [menuStack, setMenuStack] = useState<MenuItem[][]>([MENU]);
  const [mounted, setMounted] = useState(false); // ✅ ESTADO PARA HIDRATACIÓN

  useEffect(() => {
    setMounted(true); // ✅ Activa el renderizado en cliente
  }, []);

  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => setMenuStack([MENU]), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const currentMenu = menuStack[menuStack.length - 1];

  const handleItemClick = (item: MenuItem) => {
    if (item.sub) {
      setMenuStack((prev) => [...prev, item.sub!]);
    } else if (item.path) {
      setOpen(false);
      router.push(item.path);
    }
  };

  const goBack = () => {
    if (menuStack.length > 1) {
      setMenuStack((prev) => prev.slice(0, -1));
    }
  };

  // ✅ PREVENCIÓN DE ERROR DE HIDRATACIÓN:
  // Si no está montado, renderizamos la estructura básica sin Sheet para que coincida con el servidor.
  if (!mounted) {
    return (
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-[#FAFCEF]">
          <button aria-label="Abrir menú" className="p-1 outline-none">
            <Menu className="h-6 w-6 text-[#7b5ca2]" />
          </button>
          <div className="flex-1 flex justify-center">
            <Image
              src="/moonlight.png"
              alt="Moonlight Logo"
              width={120}
              height={30}
              priority
            />
          </div>
          <div className="flex items-center gap-2">
            <AuthButton />
            <CartButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAFCEF]">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button aria-label="Abrir menú" className="p-1 outline-none">
              <Menu className="h-6 w-6 text-[#7b5ca2]" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-75 p-0 flex flex-col bg-white border-none"
          >
            <SheetHeader className="p-4 border-b border-gray-100">
              <SheetTitle className="text-[#7b5ca2] flex items-center gap-2">
                {menuStack.length > 1 ? (
                  <button
                    onClick={goBack}
                    className="flex items-center gap-2 text-sm font-bold outline-none"
                  >
                    <ArrowLeft className="h-4 w-4" /> Volver
                  </button>
                ) : (
                  "Menú"
                )}
              </SheetTitle>
            </SheetHeader>

            <div className="px-4 py-3">
              <SearchInput onResultClick={() => setOpen(false)} />
            </div>

            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-50">
                {currentMenu.map((item) => {
                  const isActive = item.path === pathname;

                  return (
                    <li key={item.label}>
                      {!item.sub && item.path ? (
                        <Link
                          href={item.path}
                          onClick={() => setOpen(false)}
                          className={`flex items-center justify-between px-5 py-4 text-[#7b5ca2] transition-colors
                            ${isActive ? "bg-[#f3eefb] font-bold" : "active:bg-[#f3eefb]"}`}
                        >
                          <span className="text-[16px]">{item.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleItemClick(item)}
                          className="w-full flex items-center justify-between px-5 py-4 text-[#7b5ca2] active:bg-[#f3eefb] transition-colors outline-none"
                        >
                          <span className="text-[16px]">{item.label}</span>
                          {item.sub && (
                            <ChevronDown className="h-4 w-4 -rotate-90 opacity-50" />
                          )}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex-1 flex justify-center">
          <Image
            src="/moonlight.png"
            alt="Moonlight Logo"
            width={120}
            height={30}
            priority
          />
        </Link>

        <div className="flex items-center gap-2">
          <AuthButton />
          <CartButton />
        </div>
      </div>
    </div>
  );
};

"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";

import { ChevronDown } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { AuthButton } from "./AuthButton";
import { CartButton } from "./CartButton";
import { SearchInput } from "../search/SearchInput";
import { useState } from "react";

/* ───────────────────────────────────────────── */
/* Types */
/* ───────────────────────────────────────────── */

interface MenuItem {
  label: string;
  path?: string;
  sub?: MenuItem[];
}

/* ───────────────────────────────────────────── */
/* Menu structure (MOBILE) CORREGIDA */
/* ───────────────────────────────────────────── */

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
      { label: "Guía de Compra", path: "/como-comprar" },
      { label: "Políticas de Compra", path: "/politicas-de-compras" },
      { label: "Guía de Talles", path: "/guia-de-talles" },
      { label: "Mayoristas", path: "/mayoristas" },
      { label: "Preguntas Frecuentes", path: "/preguntas-frecuentes" },
    ],
  },
  { label: "¿Quiénes Somos?", path: "/quienes-somos" },
  { label: "Experiencia Moonlight", path: "/comentar" },
  { label: "Army Club", path: "/" },
  { label: "Calendario Lunar", path: "/" },
];

/* ───────────────────────────────────────────── */
/* Component */
/* ───────────────────────────────────────────── */

export const NavbarMobile = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [menuStack, setMenuStack] = useState<MenuItem[][]>([MENU]);

  const currentMenu = menuStack[menuStack.length - 1];

  const goForward = (item: MenuItem) => {
    if (item.sub) {
      setMenuStack((prev) => [...prev, item.sub!]);
    } else if (item.path) {
      setOpen(false);
      // Pequeño delay para cerrar el sheet antes de navegar
      setTimeout(() => {
        setMenuStack([MENU]);
        router.push(item.path!);
      }, 100);
    }
  };

  const goBack = () => {
    if (menuStack.length > 1) {
      setMenuStack((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="md:hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#FAFCEF]">
        <Sheet
          open={open}
          onOpenChange={(isOpen) => {
            setOpen(isOpen);
            if (!isOpen) setMenuStack([MENU]); // Reset stack al cerrar
          }}
        >
          <SheetTrigger asChild>
            <button aria-label="Abrir menú">
              <svg
                className="h-6 w-6 text-[#7b5ca2]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-72 p-4 overflow-hidden bg-white"
          >
            <SheetHeader className="text-left">
              <SheetTitle className="text-lg text-[#7b5ca2] flex items-center">
                {menuStack.length > 1 ? (
                  <button
                    onClick={goBack}
                    className="mb-3 flex items-center gap-1 text-sm text-[#7b5ca2] font-bold"
                  >
                    ← Volver
                  </button>
                ) : (
                  <span className="mb-3">Menú</span>
                )}
              </SheetTitle>
            </SheetHeader>

            <SearchInput placeholder="Buscar productos..." />

            {/* Menu */}
            <div className="relative mt-4">
              <ul key={menuStack.length} className="space-y-1 animate-slide-in">
                {currentMenu.map((item) => {
                  const isActive = item.path === pathname;

                  return (
                    <li key={item.label}>
                      <button
                        onClick={() => goForward(item)}
                        className={`w-full flex items-center justify-between rounded-md px-3 py-3 text-left text-[#7b5ca2]
                          hover:bg-[#f3eefb] transition-colors
                          ${isActive ? "bg-[#f3eefb] font-bold" : ""}`}
                      >
                        <span className="text-[16px]">{item.label}</span>
                        {item.sub && (
                          <ChevronDown className="h-4 w-4 -rotate-90 text-[#7b5ca2]" />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <div className="flex-1 flex justify-center">
          <Image
            src="/moonlight.png"
            alt="Moonlight Logo"
            width={120}
            height={30}
            priority
            className="cursor-pointer"
            onClick={() => router.push("/")}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <AuthButton />
          <CartButton />
        </div>
      </div>

      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

"use client";

import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
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

/* ───────────────────────────────────────────── */
/* Types */
/* ───────────────────────────────────────────── */

interface MenuItem {
  label: string;
  path?: string;
  sub?: MenuItem[];
}

/* ───────────────────────────────────────────── */
/* Menu structure (MOBILE) */
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
                  { label: "RM", path: "/productos/bts/rm" },
                  { label: "Jin", path: "/productos/bts/jin" },
                  { label: "Suga", path: "/productos/bts/suga" },
                  { label: "J-Hope", path: "/productos/bts/j-hope" },
                  { label: "Jimin", path: "/productos/bts/jimin" },
                  { label: "Taehyung", path: "/productos/bts/taehyung" },
                  { label: "Jungkook", path: "/productos/bts/jungkook" },
                  { label: "Rap Line", path: "/productos/bts/rap-line" },
                  { label: "Vocal Line", path: "/productos/bts/vocal-line" },
                ],
              },
              {
                label: "Stray Kids",
                path: "/productos/remeras/stray-kids",
              },
              { label: "The Rose", path: "/productos/remeras/the-rose" },
              {
                label: "Jonas Brothers",
                path: "/productos/remeras/jonas-brothers",
              },
              { label: "New Jeans", path: "/productos/remeras/new-jeans" },
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
                    path: "/productos/abrigos/hoodies/bts",
                  },
                  {
                    label: "Stray Kids",
                    path: "/productos/abrigos/hoodies/stray-kids",
                  },
                ],
              },
              {
                label: "Buzos",
                sub: [
                  {
                    label: "BTS",
                    path: "/productos/abrigos/buzos/bts",
                  },
                  {
                    label: "Stray Kids",
                    path: "/productos/abrigos/buzos/stray-kids",
                  },
                ],
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
            path: "/productos/bangtan-limited/accesorios",
          },
          {
            label: "Bangtan Bags",
            path: "/productos/bangtan-limited/bags",
          },
          {
            label: "Bangtan Home",
            path: "/productos/bangtan-limited/home",
          },
        ],
      },
      { label: "Gift Cards", path: "/productos/gift-cards" },
    ],
  },

  {
    label: "¿Cómo comprar?",
    sub: [
      { label: "Guía de Compra", path: "/cliente/como-comprar" },
      {
        label: "Políticas de Compra",
        path: "/cliente/politicas-de-compras",
      },
      { label: "Guía de Talles", path: "/cliente/guia-de-talles" },
      { label: "Mayoristas", path: "/cliente/mayoristas" },
      {
        label: "Preguntas Frecuentes",
        path: "/cliente/preguntas-frecuentes",
      },
    ],
  },

  { label: "¿Quiénes Somos?", path: "/cliente/quienes-somos" },
  { label: "Experiencia Moonlight", path: "/cliente/comentar" },
  { label: "Army Club", path: "/cliente/" },
  { label: "Calendario Lunar", path: "/cliente/" },
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
      setMenuStack([MENU]);
      router.push(item.path);
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
      <div className="flex items-center justify-between px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
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

          <SheetContent side="left" className="w-72 p-4 overflow-hidden">
            <SheetHeader>
              <SheetTitle className="text-lg text-[#7b5ca2]">
                {menuStack.length > 1 && (
                  <button
                    onClick={goBack}
                    className="mb-3 flex items-center gap-1 text-sm text-gray-500"
                  >
                    ← Volver
                  </button>
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
                        className={`w-full flex items-center justify-between rounded-md px-3 py-2 text-left
                          hover:bg-[#f3eefb]
                          ${isActive ? "bg-[#f3eefb] font-medium" : ""}`}
                      >
                        <span>{item.label}</span>
                        {item.sub && (
                          <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400" />
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
        <Image
          src="/moonlight.png"
          alt="Moonlight Logo"
          width={120}
          height={30}
          priority
          style={{ cursor: "pointer" }}
          onClick={() => router.push("/")}
        />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <AuthButton />
          <CartButton />
        </div>
      </div>

      {/* animation */}
      <style jsx>{`
        .animate-slide-in {
          animation: slideIn 0.2s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(12px);
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

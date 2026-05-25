import type { Metadata, Viewport } from "next";
import "./globals.css";
import clsx from "clsx";
import { Toaster } from "react-hot-toast";

import {
  Love_Ya_Like_A_Sister,
  Montserrat,
  Dancing_Script,
} from "next/font/google";

import Providers from "../Providers";
import { AddedToCartModal } from "@/components/cart/Added-To-Cart-Modal";
import CookieConsent from "@/components/home/Cookies";
import SkyBackground from "@/components/shared/Sky-Background"; // Asegúrate que el nombre coincida

const loveStory = Love_Ya_Like_A_Sister({
  variable: "--font-love-story",
  weight: ["400"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moonlight | Tienda con Alma Romántica",
  description: "Descubre productos únicos con un toque de magia y romance.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d8c4fa",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const htmlClassName = clsx(
    loveStory.variable,
    montserrat.variable,
    dancingScript.variable,
  );

  return (
    <html lang="es" className={htmlClassName} suppressHydrationWarning>
      <body className="antialiased bg-transparent text-[#4c3a6d] font-sans relative m-0 p-0 block">
        <Providers>
          {/* ✅ AHORA SÍ: SkyBackground puede leer el NightModeContext */}
          <SkyBackground />

          <div className="relative z-10 flex flex-col min-h-screen w-full m-0 p-0">
            {children}
            <CookieConsent />
            <AddedToCartModal />
            <Toaster position="top-right" />
          </div>
        </Providers>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import {
  Love_Ya_Like_A_Sister,
  Montserrat,
  Dancing_Script,
} from "next/font/google";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Provaiders from "@/components/Provaiders";

import { Toaster } from "react-hot-toast";
import clsx from "clsx";
import { AddedToCartModal } from "@/components/cart/AddedToCartModal";
import { FavoritesProvider } from "@/context/FavoritesContext";
import WhatsAppFloat from "@/components/home/Whatsapp";
import CookieConsent from "@/components/home/Cookies";
import ParticlesStarfieldPremium from "@/components/ParticlesStarfieldPremium";


const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const loveStory =  Love_Ya_Like_A_Sister({
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
  title: "Moonlight",
  description: "Una tienda con alma romántica",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const htmlClassName = clsx(
    geistSans.variable,
    geistMono.variable,
    loveStory.variable,
    montserrat.variable,
    dancingScript.variable
  );

  return (
    <html lang="es" className={htmlClassName}>
      {/* Fondo transparente para permitir ver el canvas */}
      <body suppressHydrationWarning  className="antialiased bg-transparent text-[#4c3a6d] font-sans relative">

        {/* Fondo mágico */}
        <ParticlesStarfieldPremium />

        {/* Contenido siempre por encima del canvas */}
        <div className="relative z-10">

          <AuthProvider>
            <FavoritesProvider>
              <CartProvider>
                <Provaiders>
                  {children}
                </Provaiders>

                <WhatsAppFloat />
                <CookieConsent />
                <AddedToCartModal />

                {/* Toast personalizado en color lila */}
                <Toaster
                  position="top-right"
                  toastOptions={{
                    style: {
                      background: "#d8c4fa",   // pastel lilac
                      color: "#4c3a6d",        // texto lila oscuro
                      borderRadius: "10px",
                      border: "1px solid #cbb0f5",
                    },
                  }}
                />
              </CartProvider>
            </FavoritesProvider>
          </AuthProvider>

        </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  Love_Ya_Like_A_Sister,
  Montserrat,
  Dancing_Script,
} from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "next-themes";
//import { SidebarProvider } from "@/components/ui/sidebar";

// Tipografías base
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Nuevas tipografías decorativas
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
  weight: ["400", "500", "700"], // Podés ajustar los pesos si querés
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Moonlight",
  description: "Una tienda con alma romántica",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`
        ${geistSans.variable}
        ${geistMono.variable}
        ${loveStory.variable}
        ${montserrat.variable}
        ${dancingScript.variable}
      `}
    >
      <body className="antialiased bg-[#f5f0fa] text-[#4c3a6d] font-sans">
        {/* <SidebarProvider> */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        {/* </SidebarProvider> */}
      </body>
    </html>
  );
}


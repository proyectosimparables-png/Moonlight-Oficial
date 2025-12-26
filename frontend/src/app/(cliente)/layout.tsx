"use client";

import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/home/Footer";
import WhatsAppFloat from "@/components/home/Whatsapp";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative z-10 min-h-screen text-[#4c3a6d]">
      <Navbar />

      <main className="flex-1 bg-transparent">
        {children}
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}

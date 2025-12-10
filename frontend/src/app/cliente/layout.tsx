"use client";
import Navbar from "@/components/navbar/Navbar";
import ParticlesStarfieldPremium from "@/components/ParticlesStarfieldPremium";
import { Toaster } from "sonner";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f5f0fa] text-[#4c3a6d]">
          <ParticlesStarfieldPremium />
        {children}
        <Toaster position="top-center" />
      </main>
    </>
  );
}

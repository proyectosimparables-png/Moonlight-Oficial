"use client";

import { useEffect } from "react";
import { useNightMode } from "@/context/NightModeContext";

export default function SkyBackground() {
  const { isNight } = useNightMode();

  useEffect(() => {
    const hour = new Date().getHours();
    console.log("Hora actual:", hour, isNight ? "(Noche)" : "(Día)");
  }, [isNight]);

  return (
    <div
      className={`fixed inset-0 w-full h-full -z-50 transition-colors duration-1000 ease-in-out pointer-events-none ${
        isNight ? "bg-[#d8c4fa]" : "bg-[#fafcef]"
      }`}
    >
      {/* 🌙 Luna / Sol: Animada */}
      <div
        className={`absolute top-[10%] right-[10%] w-20 h-20 rounded-full transition-all duration-1000 blur-[2px] ${
          isNight
            ? "opacity-100 scale-100 bg-[#ffffe6] shadow-[0_0_50px_rgba(255,255,220,0.8)]"
            : "opacity-0 scale-50 bg-[#fff9e6]"
        }`}
      />

      {/* 🌫️ Nebulosa: Gradientes suaves */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        style={{
          background: isNight
            ? "radial-gradient(circle at 70% 30%, rgba(123,92,162,0.25) 0%, transparent 70%)"
            : "radial-gradient(circle at 30% 70%, rgba(216,196,250,0.2) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

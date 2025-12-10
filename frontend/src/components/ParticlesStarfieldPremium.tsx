"use client";

import { useEffect, useRef, useState } from "react";
import { useNightMode } from "@/context/NightModeContext";

export default function ParticlesStarfieldPremium() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isNight, setIsNight } = useNightMode();


  // ⏰ Revisar hora cada 1 minuto (y al iniciar)
  useEffect(() => {
    const updateHour = () => {
      const hour = new Date().getHours();
      setIsNight(hour >= 19 || hour < 6);
    };

    updateHour(); // primera ejecución

    const interval = setInterval(updateHour, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const stars: any[] = [];
    const shootingStars: any[] = [];

    // 🌄 Fondo de día / noche
    const bgDay = new Image();
    const bgNight = new Image();

    bgDay.src = "/bg-day.png"; // tu imagen día
    bgNight.src = "/bg-night.png"; // tu imagen noche

    let imagesLoaded = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const dayStarColor = "rgba(255, 232, 150, 0.9)";
    const nightStarColor = "rgba(255,255,255,1)";
    const nebulaColorDay = "rgba(216,196,250,0.28)";
    const nebulaColorNight = "rgba(123,92,162,0.4)";

    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < 150; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.7,
          opacity: 1,
          color: isNight ? nightStarColor : dayStarColor,
          driftX: (Math.random() - 0.5) * 0.12,
          driftY: (Math.random() - 0.5) * 0.12,
        });
      }
    };

    const createShootingStar = () => {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.3,
        length: Math.random() * 90 + 30,
        speed: Math.random() * 8 + 4,
        opacity: 1,
      });
    };

    setInterval(() => {
      if (Math.random() < 0.18) createShootingStar();
    }, 2000);

    const drawNebula = () => {
      const gradient = ctx.createRadialGradient(
        canvas.width * 0.5,
        canvas.height * 0.5,
        80,
        canvas.width * 0.5,
        canvas.height * 0.5,
        canvas.width
      );

      gradient.addColorStop(0, isNight ? nebulaColorNight : nebulaColorDay);
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // 🌙 Luna animada de noche
    const moon = {
      x: canvas.width * 0.8,
      y: canvas.height * 0.2,
      radius: 45,
      angle: 0,
      speed: 0.0015,
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 🖼 Fondo
      const bg = isNight ? bgNight : bgDay;
      ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

      drawNebula();

      // ⭐ Estrellas normales
      stars.forEach((s) => {
        s.x += s.driftX;
        s.y += s.driftY;

        if (s.x < 0) s.x = canvas.width;
        if (s.x > canvas.width) s.x = 0;
        if (s.y < 0) s.y = canvas.height;
        if (s.y > canvas.height) s.y = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = isNight ? 25 : 10;
        ctx.fill();
      });

      // 🌠 Estrellas fugaces
      shootingStars.forEach((ss, i) => {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,255,255,${ss.opacity})`;
        ctx.lineWidth = 2;
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.length, ss.y + ss.length / 3);
        ctx.stroke();

        ss.x -= ss.speed;
        ss.y += ss.speed * 0.3;
        ss.opacity -= 0.02;

        if (ss.opacity <= 0) shootingStars.splice(i, 1);
      });

      // 🌙 Luna visible solo de noche
      if (isNight) {
        moon.angle += moon.speed;
        const moonX = moon.x + Math.sin(moon.angle) * 50;
        const moonY = moon.y + Math.cos(moon.angle) * 20;

        ctx.beginPath();
        ctx.arc(moonX, moonY, moon.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 230, 0.95)";
        ctx.shadowColor = "rgba(255, 255, 220, 0.8)";
        ctx.shadowBlur = 35;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    // 🔥 Esperar a que ambas imágenes terminen de cargar
    bgDay.onload = bgNight.onload = () => {
      imagesLoaded++;
      if (imagesLoaded === 2) {
        initStars();
        animate();
      }
    };

    return () => window.removeEventListener("resize", resizeCanvas);
  }, [isNight]); // 👈 importantísimo: se redibuja cuando cambia día/noche

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen -z-10 pointer-events-none transition-all duration-700"
    />
  );
}

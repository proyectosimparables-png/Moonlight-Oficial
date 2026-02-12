"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Tipo del contexto
interface NightModeContextType {
  isNight: boolean;
  setIsNight: (value: boolean) => void;
}

const NightModeContext = createContext<NightModeContextType>({
  isNight: false,
  setIsNight: () => {},
});

export const NightModeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isNight, setIsNight] = useState(false);

  // Verificar la hora y actualizar el estado isNight
  useEffect(() => {
    const updateHour = () => {
      const hour = new Date().getHours();
      // Cambiar a modo nocturno entre 19:00 y 06:00
      setIsNight(hour >= 19 || hour < 6);
    };

    updateHour(); // Inicializamos el valor al cargar el componente
    const interval = setInterval(updateHour, 60000); // Actualiza cada minuto

    return () => clearInterval(interval); // Limpiar el intervalo cuando se desmonte el componente
  }, []); // Este efecto solo se ejecuta una vez al montar el componente

  return (
    <NightModeContext.Provider value={{ isNight, setIsNight }}>
      {children}
    </NightModeContext.Provider>
  );
};

export const useNightMode = () => useContext(NightModeContext);

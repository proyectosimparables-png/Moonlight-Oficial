import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// Agregá esto (es para el mantenimiento)
export function getVipCode(): string | undefined {
  if (typeof document === 'undefined') return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; moonlight_vip_access=`);

  if (parts.length === 2) {
    return parts.pop()?.split(';').shift();
  }
  return undefined;
}
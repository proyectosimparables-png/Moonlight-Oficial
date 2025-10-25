import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // opcional, pero recomendado
  images: {
    domains: ["res.cloudinary.com"], // aquí agregás todos los dominios externos que uses
  },
};

export default nextConfig;

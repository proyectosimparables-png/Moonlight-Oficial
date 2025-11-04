import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // opcional, pero recomendado
  images: {
   domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "ui-avatars.com", 
    ], 
  },
};

export default nextConfig;

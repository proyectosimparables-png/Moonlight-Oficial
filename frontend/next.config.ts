import type { NextConfig } from "next";
import { hostname } from "os";

const nextConfig: NextConfig = {
  reactStrictMode: true, // opcional, pero recomendado
  images: {
   domains: [
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
      "ui-avatars.com",
     hostname(),
      
        
    ], 
  },
   api: {
    bodyParser: {
      sizeLimit: '8mb', // Set the desired value here
    },
  },
};

export default nextConfig;

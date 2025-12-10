"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { registerLocal } from "@/services/authService";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: ""
  });

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      const res = await registerLocal(
        form.name,
        form.email,
        form.password,
        form.address
      );

    
      toast.success("Cuenta creada 🎉");
      router.push("/login");
    } catch (error) {
      toast.error("Hubo un error al registrar");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen  bg-transparent p-4">
      <div className="w-full max-w-md bg-white border border-[#e6dff1] rounded-2xl shadow-xl p-8 text-center animate-fadeIn">

        <h2 className="text-3xl font-semibold text-[#7b5ca2] mb-6">
          Crear Cuenta ✨
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            type="text"
            placeholder="Nombre completo"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7b5ca2]"
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7b5ca2]"
          />

          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7b5ca2]"
          />

          <input
            name="address"
            type="text"
            placeholder="Domicilio (Ej: Calle falsa 4561)"
            onChange={handleChange}
            className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7b5ca2]"
          />

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#7b5ca2] text-white hover:bg-[#654a91] transition-all shadow-md"
          >
            Registrarme
          </button>
        </form>

        <p className="mt-5 text-[#7b5ca2] text-sm">
          ¿Ya tienes una cuenta?{" "}
          <span
            onClick={() => router.push("/login")}
            className="font-semibold underline cursor-pointer"
          >
            Inicia sesión
          </span>
        </p>

        <p className="mt-6 text-[#7b5ca2] text-xs opacity-80">
          Gracias por visitar <strong>Moonlight</strong> 💜✨
        </p>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react"; // Importamos iconos

export default function LoginForm() {
    const router = useRouter();
    const { loginLocal } = useAuth();
    const [showPassword, setShowPassword] = useState(false); // ESTADO NUEVO
    const [form, setForm] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e: any) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        try {
            await loginLocal(form.email, form.password);
            toast.success("Inicio de sesión correcto 🎉");
            router.refresh();
            router.push("/");
        } catch (error) {
            toast.error("Credenciales incorrectas");
        }
    };

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ 
            provider: "google", 
            options: { redirectTo: window.location.origin + "/auth/callback" } 
        }); 
        if (error) console.error("Error al iniciar sesión:", error);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-transparent p-4">
            <div className="w-full max-w-md bg-white border border-[#ddd1f2] rounded-2xl shadow-xl p-8 text-center">
                <h2 className="text-3xl font-semibold text-[#6a46a7] mb-6">Iniciar Sesión</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        onChange={handleChange}
                        className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#7b5ca2] focus:outline-none"
                    />

                    {/* CONTENEDOR DE CONTRASEÑA */}
                    <div className="relative">
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"} // TIPO DINÁMICO
                            placeholder="Contraseña"
                            onChange={handleChange}
                            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#7b5ca2] focus:outline-none pr-12"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7b5ca2] transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 rounded-lg bg-[#7b5ca2] text-white hover:bg-[#654a91] transition-all shadow-md"
                    >
                        Entrar
                    </button>
                </form>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3 mt-4 flex items-center justify-center gap-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
                >
                    <img src="/google-logo.png" alt="google" className="w-5" />
                    Continuar con Google
                </button>

                <p className="mt-6 text-[#7b5ca2]">
                    ¿No tienes cuenta?{" "}
                    <span
                        onClick={() => router.push("/register")}
                        className="underline font-semibold cursor-pointer"
                    >
                        Regístrate aquí
                    </span>
                </p>

                <p className="mt-6 text-xs text-[#7b5ca2] opacity-70">
                    Gracias por visitar Moonlight 💜
                </p>
            </div>
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  registerLocal,
  resendCodeLocal,
  verifyEmailLocal,
} from "@/services/autenticacion-service";
// Importamos los iconos (opcional, puedes usar emojis si prefieres)
import { Eye, EyeOff } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<"register" | "verify">("register");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // ESTADO NUEVO

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
  });

  const [verificationCode, setVerificationCode] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerLocal(form.name, form.email, form.password, form.address);
      toast.success("¡Casi listo! Revisa tu correo 📧");
      setStep("verify");
    } catch (error: any) {
      toast.error(error.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length < 6)
      return toast.error("Ingresa los 6 dígitos");
    setLoading(true);
    try {
      await verifyEmailLocal(verificationCode);
      toast.success("¡Cuenta verificada con éxito! 🎉");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Código incorrecto");
    } finally {
      setLoading(false);
    }
  };

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleResend = async () => {
    try {
      await resendCodeLocal();
      toast.success("Nuevo código enviado 📧");
      setTimer(60);
    } catch (error) {
      toast.error("Error al reenviar");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-transparent p-4">
      <div className="w-full max-w-md bg-white border border-[#e6dff1] rounded-2xl shadow-xl p-8 text-center animate-fadeIn">
        {step === "register" ? (
          <>
            <h2 className="text-3xl font-semibold text-[#7b5ca2] mb-6">
              Crear Cuenta ✨
            </h2>
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <label htmlFor="name" className="sr-only">
                Nombre
              </label>
              <input
                name="name"
                required
                type="text"
                placeholder="Nombre"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7b5ca2]"
              />
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                name="email"
                required
                type="email"
                placeholder="Email"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7b5ca2]"
              />

              {/* CONTENEDOR DE CONTRASEÑA */}
              <div className="relative">
                <label htmlFor="password" className="sr-only">
                  Contraseña
                </label>
                <input
                  name="password"
                  required
                  type={showPassword ? "text" : "password"} // TIPO DINÁMICO
                  placeholder="Contraseña"
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7b5ca2] pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7b5ca2] transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <label htmlFor="address" className="sr-only">
                Domicilio
              </label>
              <input
                name="address"
                required
                type="text"
                placeholder="Domicilio (Ej: Calle falsa 4561)"
                onChange={handleChange}
                className="w-full p-3 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#7b5ca2]"
              />
              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 rounded-lg bg-[#7b5ca2] text-white hover:bg-[#654a91] transition-all shadow-md disabled:opacity-50"
              >
                {loading ? "Procesando..." : "Registrarme"}
              </button>
            </form>
          </>
        ) : (
          /* Resto del código de verificación igual... */
          <div className="animate-fadeIn">
            <h2 className="text-3xl font-semibold text-[#7b5ca2] mb-2">
              Verifica tu Email 📧
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Hemos enviado un código de 6 dígitos a <br />
              <span className="font-medium text-[#7b5ca2]">{form.email}</span>
            </p>
            <form onSubmit={handleVerifySubmit} className="space-y-6">
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                placeholder="000000"
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                className="w-full text-center text-3xl tracking-[10px] font-bold p-3 border-2 border-[#e6dff1] rounded-lg focus:outline-none focus:border-[#7b5ca2] text-[#7b5ca2]"
              />
              <button
                disabled={loading}
                type="submit"
                className="w-full py-3 rounded-lg bg-[#7b5ca2] text-white hover:bg-[#654a91] transition-all shadow-md disabled:opacity-50 font-semibold"
              >
                {loading ? "Verificando..." : "Confirmar Código"}
              </button>
              <div className="mt-6">
                {timer > 0 ? (
                  <p className="text-sm text-gray-400 italic">
                    Puedes reenviar el código en {timer} segundos
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-sm font-semibold text-[#7b5ca2] hover:underline"
                  >
                    ¿No recibiste el código? Reenviar código
                  </button>
                )}
              </div>
            </form>
            <button
              onClick={() => setStep("register")}
              className="mt-4 text-xs text-gray-400 hover:text-[#7b5ca2] underline transition-colors"
            >
              Volver atrás / Corregir email
            </button>
          </div>
        )}

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

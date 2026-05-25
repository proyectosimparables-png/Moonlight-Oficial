// src/app/admin/configuracion-envio/page.tsx

import ConfigEnvio from "@/componentes/admin/ConfigEnvio";

export default function ConfigEnvioPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Configuración General
      </h1>
      <ConfigEnvio />
    </div>
  );
}

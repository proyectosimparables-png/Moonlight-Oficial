# 🌙 Moonlight – Ecommerce Full Stack & ARMY Community

**Moonlight** es una plataforma de e-commerce personalizada, diseñada para transformar la experiencia de compra de indumentaria en una vivencia interactiva para la comunidad fan. Este proyecto migra la operativa de una tienda real desde Tienda Nube hacia una solución propia, permitiendo total libertad creativa y optimización de costos operativos.

## 🚀 Stack Tecnológico

### Frontend

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) con Turbopack.
- **Estilos:** Tailwind CSS + Lucide React (iconografía).
- **UI Components:** Radix UI + Sonner + Framer Motion (microinteracciones).
- **Estado & Fetching:** TanStack Query (React Query) + React Hot Toast.

### Backend

- **Framework:** [NestJS 11](https://nestjs.com/) (Node.js).
- **Base de Datos:** PostgreSQL alojada en [Supabase](https://supabase.com/).
- **ORM:** [Prisma](https://www.prisma.io/).
- **Validación:** Class-validator & Class-transformer.
- **Seguridad:** Bcrypt (Hashing) + JWT (Autenticación).

### Servicios Externos e Infraestructura

- **Imágenes:** [Cloudinary](https://cloudinary.com/) (Upload dinámico vía Multer).
- **Pagos:** Mercado Pago SDK, Ualá Go Cuotas (Integración vía Webhooks).
- **Mailing:** Nodemailer + NestJS Schedule (Automatización de carritos abandonados).
- **Infraestructura:** Cloud VPS (Ubuntu) con Nginx (Reverse Proxy) y PM2.

---

## 📂 Estructura del Proyecto (Monorepo)

```text
moonlight-oficial/
├── backend/           # API Rest con NestJS (Lógica de negocio y DB)
│   ├── prisma/        # Esquema de datos, variantes (talles/colores) y seeds
│   └── src/           # Módulos, Servicios y Controladores
├── frontend/          # Interfaz de usuario con Next.js 15
│   ├── src/           # Components, Hooks, Contexts y App Router
│   └── public/        # Recursos estáticos
└── .env               # Configuración de producción

```

## 🗓 Roadmap de Desarrollo

### Fase 1: MVP & Gestión Administrativa

- **Setup de Monorepo:** Configuración de NestJS 11 y Next.js 15.
- **Modelado de datos:** Prisma (Usuarios, Productos, Variantes, Órdenes).
- **Panel Admin:** Dashboard para gestión de productos, stock y categorías.
- **Multimedia:** Integración de Cloudinary para manejo de archivos.
- **Pagos:** Implementación de Pasarelas (Mercado Pago / Ualá).

### Fase 2: Experiencia e Interacción

- **Mascota Puchi:** Sistema de guía y onboarding interactivo.
- **Quiz Lunar:** Recomendaciones personalizadas de productos.
- **Sección ARMY:** Acceso a contenido exclusivo y descargables post-compra.
- **UX Avanzada:** Animaciones con Framer Motion.

### Fase 3: Automatización y Lanzamiento

- **Marketing Tools:** Automatización de mails (Nodemailer + Schedule).
- **Muro de Constelaciones:** Módulo de feedback y comunidad.
- **Deploy:** Configuración de entorno de producción en VPS con SSL.

---

## 🛠️ Instalación

1. Clona el repo.
2. `npm install` en /frontend y /backend.
3. Configura los `.env`.
4. `npm run dev`.

---

## ✨ Autoras

Proyecto desarrollado con ❤️ para **Moonlight** por:

- **Macarena** — [GitHub](https://github.com/MacarenaAliberti-web) • [LinkedIn](https://www.linkedin.com/in/macarena-aliberti-440b03373/)
- **Natalia** — [GitHub](https://github.com/Russ) • [LinkedIn](https://www.linkedin.com/in/russ-villalba/)

---

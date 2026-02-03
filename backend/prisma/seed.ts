import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

/* ---------------- SLUGIFY ---------------- */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/* ---------------- ESTRUCTURA COMPLETA ---------------- */
const estructura = [
  { nombre: "Ver todos los productos" },
  { nombre: "Novedades" },
  { nombre: "Los más elegidos" },
  { nombre: "Outlet" },

  {
    nombre: "Indumentaria",
    categorias: [
      {
        nombre: "Remeras",
        subcategorias: [
          {
            nombre: "BTS",
            subcategorias: [
              { nombre: "RM" },
              { nombre: "Taehyung" },
              { nombre: "Jungkook" },
              { nombre: "J-Hope" },
              { nombre: "Jimin" },
              { nombre: "Jin" },
              { nombre: "Suga" },
              { nombre: "Rap Line" },
              { nombre: "Vocal Line" },
            ],
          },
          { nombre: "Stray Kids" },
          { nombre: "The Rose" },
          { nombre: "Jonas Brothers" },
          { nombre: "New Jeans" },
        ],
      },

      {
        nombre: "Abrigos",
        subcategorias: [
          {
            nombre: "Hoodies",
            subcategorias: [
              { nombre: "BTS" },
              { nombre: "Stray Kids" },
            ],
          },
          {
            nombre: "Buzos",
            subcategorias: [
              { nombre: "BTS" },
              { nombre: "Stray Kids" },
            ],
          },
        ],
      },
    ],
  },

  {
    nombre: "Bangtan Limited Edition",
    categorias: [
      { nombre: "Accesorios" },
      { nombre: "Bangtan Bags" },
      { nombre: "Bangtan Home" },
    ],
  },

  { nombre: "Gift Cards" },
];

/* ---------------- FUNCIONES RECURSIVAS ---------------- */

async function crearCategoria(nombre: string, parentId: string | null, seccionId: string | null) {
  return prisma.categoria.create({
    data: {
      nombre,
      slug: slugify(nombre), // ✅ ahora no dará error
      parentId,
      seccionId,
    } as any, // <-- para evitar TS complaining
  });
}


async function procesarCategorias(
  lista: any[],
  parentId: string | null,
  seccionId: string | null
) {
  for (const item of lista) {
    const categoria = await crearCategoria(item.nombre, parentId, seccionId);

    if (item.subcategorias) {
      await procesarCategorias(item.subcategorias, categoria.id, seccionId);
    }
  }
}

/* ---------------- SEED ---------------- */
async function main() {
  console.log("🧹 Limpiando base de datos...");

  // ORDEN CORRECTO (evita errores P2003)
  await prisma.favorito.deleteMany();
  await prisma.comentario.deleteMany();

  await prisma.ordenItem.deleteMany();
  await prisma.orden.deleteMany();

  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();

  await prisma.imagen.deleteMany();
  await prisma.producto.deleteMany();

  await prisma.categoria.deleteMany();
  await prisma.seccion.deleteMany();

  console.log("🚀 Iniciando seed...");

  for (const sec of estructura) {
    const seccion = await prisma.seccion.create({
      data: {
        nombre: sec.nombre,
        slug: slugify(sec.nombre),
      },
    });

    if (sec.categorias) {
      await procesarCategorias(sec.categorias, null, seccion.id);
    }
  }

  console.log("✨ Seed completado con éxito.");
}

main()
  .catch((e) => {
    console.error("❌ Error ejecutando el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
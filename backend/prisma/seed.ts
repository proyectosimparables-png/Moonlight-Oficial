import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 👉 Función para generar slugs sin librerías externas
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quitar acentos
    .replace(/\s+/g, "-")             // espacios a guiones
    .replace(/[^\w-]+/g, "")          // eliminar caracteres no alfanuméricos
    .replace(/--+/g, "-")             // múltiples guiones a uno solo
    .replace(/^-+/, "")                // quitar guiones al inicio
    .replace(/-+$/, "");               // quitar guiones al final
}

async function main() {
  console.log('🧹 Limpiando base de datos...');

  // 1️⃣ Limpiar tablas respetando dependencias
  await prisma.cartItem.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.seccion.deleteMany();

  console.log('✅ Base limpia, iniciando seed...');

  // 2️⃣ Crear Secciones con slugs generados con nuestra función
  const seccionesData = [
    'Los más elegidos',
    'Bangtan Home',
    'Indumentaria',
    'Bangtan Limited Edition',
    'Lo más nuevo',
    'Outlet',
    'Accesorios',
    'Bangtan Bags',
  ];

  const secciones: Record<string, any> = {};

  for (const nombre of seccionesData) {
    const slug = slugify(nombre);
    const seccion = await prisma.seccion.create({
      data: { nombre, slug },
    });
    secciones[nombre] = seccion;
    console.log(`🧩 Sección creada: ${nombre} → slug: ${slug}`);
  }

  // 3️⃣ Crear Categorías específicas para "Indumentaria"
  const categoriasData = [
    { nombre: 'Remeras', seccion: secciones['Indumentaria'] },
    { nombre: 'Abrigos', seccion: secciones['Indumentaria'] },
  ];

  const seccionesConCategorias = new Set<string>();

  for (const cat of categoriasData) {
    await prisma.categoria.create({
      data: {
        nombre: cat.nombre,
        seccionId: cat.seccion.id,
      },
    });
    seccionesConCategorias.add(cat.seccion.nombre);
    console.log(`📁 Categoría creada: ${cat.nombre} (Sección: ${cat.seccion.nombre})`);
  }

  // 4️⃣ Crear categoría "Otras" para secciones sin categorías
  for (const nombreSeccion of Object.keys(secciones)) {
    if (!seccionesConCategorias.has(nombreSeccion)) {
      await prisma.categoria.create({
        data: {
          nombre: 'Otras',
          seccionId: secciones[nombreSeccion].id,
        },
      });
      console.log(`📁 Categoría "Otras" creada en la sección: ${nombreSeccion}`);
    }
  }

  console.log('\n🌱 Seed completado correctamente ✅');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

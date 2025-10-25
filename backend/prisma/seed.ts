import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando base de datos...');

  // 1️⃣ Limpiar tablas en orden correcto
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.seccion.deleteMany();

  console.log('✅ Base limpia, iniciando seed...');

  // 2️⃣ Crear Secciones
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
    const seccion = await prisma.seccion.create({ data: { nombre } });
    secciones[nombre] = seccion;
    console.log(`🧩 Sección creada: ${nombre}`);
  }

  // 3️⃣ Crear Categorías específicas (solo para Indumentaria)
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

  // 4️⃣ Crear categoría "Otras" en las secciones sin categorías
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

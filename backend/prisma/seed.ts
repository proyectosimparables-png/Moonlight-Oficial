import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando base de datos...');

  // 1️⃣ Borrar primero los registros que dependen de otros
  await prisma.producto.deleteMany(); // Si tienes productos
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
    const seccion = await prisma.seccion.create({
      data: { nombre },
    });
    secciones[nombre] = seccion;
    console.log(`🧩 Sección creada: ${nombre}`);
  }

  // 3️⃣ Crear Categorías (solo en Indumentaria)
  const categoriasData = [
    {
      nombre: 'Remeras',
      seccion: secciones['Indumentaria'],
    },
    {
      nombre: 'Abrigos',
      seccion: secciones['Indumentaria'],
    },
  ];

  for (const cat of categoriasData) {
    await prisma.categoria.create({
      data: {
        nombre: cat.nombre,
        seccionId: cat.seccion.id,
      },
    });
    console.log(`📁 Categoría creada: ${cat.nombre}`);
  }

  console.log('\n🌱 Seed completado correctamente');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });

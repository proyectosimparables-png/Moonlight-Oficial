import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient(); // instanciamos solo para el seed

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

async function main() {
  console.log('🧹 Limpiando base de datos...');

  await prisma.cartItem.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.seccion.deleteMany();

  console.log('✅ Base limpia, iniciando seed...');

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
    const seccion = await prisma.seccion.create({ data: { nombre, slug } });
    secciones[nombre] = seccion;
    console.log(`🧩 Sección creada: ${nombre} → slug: ${slug}`);
  }

  const categoriasData = [
    { nombre: 'Remeras', seccion: secciones['Indumentaria'] },
    { nombre: 'Abrigos', seccion: secciones['Indumentaria'] },
  ];

  const seccionesConCategorias = new Set<string>();

  for (const cat of categoriasData) {
    await prisma.categoria.create({
      data: { nombre: cat.nombre, seccionId: cat.seccion.id },
    });
    seccionesConCategorias.add(cat.seccion.nombre);
  }

  for (const nombreSeccion of Object.keys(secciones)) {
    if (!seccionesConCategorias.has(nombreSeccion)) {
      await prisma.categoria.create({
        data: { nombre: 'Otras', seccionId: secciones[nombreSeccion].id },
      });
    }
  }

  console.log('🌱 Seed completado correctamente ✅');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect(); // IMPORTANTE: desconecta para no saturar Supabase
  });

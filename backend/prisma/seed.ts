import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Crear Secciones
  const seccionesData = [
    'Ropa',
    'Ediciones Especiales',
    'Bazar',
    'Lo más vendido',
    'Ofertas',
    'Lo más nuevo',
  ];

  const secciones = {};
  for (const nombre of seccionesData) {
    const seccion = await prisma.seccion.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    secciones[nombre] = seccion;
    console.log(`🧩 Sección creada: ${nombre}`);
  }

  // Crear Tipos de Prenda
  const tiposPrendaData = ['Remera', 'Hoodie', 'Buzo', 'Accesorio'];
  const tiposPrenda = {};
  for (const nombre of tiposPrendaData) {
    const tipo = await prisma.tipoPrenda.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    });
    tiposPrenda[nombre] = tipo;
    console.log(`👕 Tipo de Prenda creada: ${nombre}`);
  }

  // Crear Categorías principales
  // Nota: Relacionamos las categorías con seccionId y tipoPrendaId (si aplica)
  const categoriasPrincipalesData = [
    { nombre: 'Remeras', seccion: secciones['Ropa'], tipoPrenda: tiposPrenda['Remera'] },
    { nombre: 'Hoodies', seccion: secciones['Ropa'], tipoPrenda: tiposPrenda['Hoodie'] },
    { nombre: 'Buzos', seccion: secciones['Ropa'], tipoPrenda: tiposPrenda['Buzo'] },
    { nombre: 'Accesorios', seccion: secciones['Ropa'], tipoPrenda: tiposPrenda['Accesorio'] },
    { nombre: 'Bangtan Limited Edition', seccion: secciones['Ediciones Especiales'], tipoPrenda: null },
    { nombre: 'Bangtan Bags', seccion: secciones['Ediciones Especiales'], tipoPrenda: null },
    { nombre: 'Bangtan Home', seccion: secciones['Bazar'], tipoPrenda: null },
  ];

  const categoriasPrincipales = {};
  for (const cat of categoriasPrincipalesData) {
    const categoria = await prisma.categoria.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: {
        nombre: cat.nombre,
        seccionId: cat.seccion.id,
        tipoPrendaId: cat.tipoPrenda ? cat.tipoPrenda.id : undefined,
      },
    });
    categoriasPrincipales[cat.nombre] = categoria;
    console.log(`📁 Categoría principal creada: ${cat.nombre}`);
  }

  // Subcategorías de Remeras
  const subcategoriasRemerasData = ['BTS', 'Stray Kids', 'The Rose', 'New Jeans'];
  const subcategoriasRemeras = {};
  for (const nombre of subcategoriasRemerasData) {
    const subcat = await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: {
        nombre,
        padreId: categoriasPrincipales['Remeras'].id,
      },
    });
    subcategoriasRemeras[nombre] = subcat;
    console.log(`  └─ 📂 Subcategoría creada: ${nombre} (de Remeras)`);
  }

  // Sub-subcategorías de BTS
  const subSubcategoriasBTS = [
    'RM',
    'Jin',
    'Suga',
    'J-Hope',
    'Jimin',
    'Taehyung',
    'Jungkook',
    'Rap Line',
    'Vocal Line',
  ];

  for (const nombre of subSubcategoriasBTS) {
    await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: {
        nombre,
        padreId: subcategoriasRemeras['BTS'].id,
      },
    });
    console.log(`      └─ 🔸 Sub-subcategoría creada: ${nombre} (de BTS)`);
  }

  console.log('\n✅ Seed completado correctamente');
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando el seed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

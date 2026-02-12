import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const productos = await prisma.producto.findMany();

    console.log(`--- Iniciando actualización de ${productos.length} productos ---`);

    for (const p of productos) {
        // Generar slug base
        let baseSlug = p.nombre
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");

        // Verificar si el slug ya existe (por si hay nombres duplicados)
        const existe = await prisma.producto.findFirst({
            where: { slug: baseSlug, NOT: { id: p.id } }
        });

        const finalSlug = existe ? `${baseSlug}-${p.id.substring(0, 4)}` : baseSlug;

        await prisma.producto.update({
            where: { id: p.id },
            data: { slug: finalSlug }
        });

        console.log(`✅ ${p.nombre} -> ${finalSlug}`);
    }

    console.log("--- Proceso terminado con éxito ---");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
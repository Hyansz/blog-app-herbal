import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    // =========================
    // USER
    // =========================

    const adminPassword = await bcrypt.hash("admin123", 10);

    const userPassword = await bcrypt.hash("user123", 10);

    await prisma.user.upsert({
        where: {
            email: "admin@jamoe.com",
        },
        update: {},
        create: {
            name: "Admin",
            email: "admin@jamoe.com",
            password: adminPassword,
            role: Role.ADMIN,
        },
    });

    await prisma.user.upsert({
        where: {
            email: "user@jamoe.com",
        },
        update: {},
        create: {
            name: "User",
            email: "user@jamoe.com",
            password: userPassword,
            role: Role.USER,
        },
    });

    // =========================
    // CATEGORY
    // =========================

    const categories = [
        {
            name: "Rimpang",
            slug: "rimpang",
        },
        {
            name: "Rempah",
            slug: "rempah",
        },
        {
            name: "Daun",
            slug: "daun",
        },
        {
            name: "Penyakit",
            slug: "penyakit",
        },
        {
            name: "Informasi",
            slug: "informasi",
        },
        {
            name: "Tips Sehat",
            slug: "tips-sehat",
        },
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: {
                slug: category.slug,
            },
            update: {},
            create: category,
        });
    }

    console.log("✅ Seed berhasil");
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);

        await prisma.$disconnect();

        process.exit(1);
    });
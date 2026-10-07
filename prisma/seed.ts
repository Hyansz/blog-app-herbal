import "dotenv/config";

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/* Gagal cepat dengan pesan jelas, tanpa stack trace. */
function fail(message: string): never {
    console.error("");
    console.error("❌ Seed dihentikan.");
    console.error(`   ${message}`);
    console.error("");
    process.exit(1);
}

/* Password seed tidak pernah ditulis di kode maupun di repo.
   Nilainya wajib datang dari environment variable. */
function requireSecret(name: string): string {
    const value = process.env[name];

    if (!value) {
        fail(
            `Environment variable ${name} belum diisi. ` +
                "Isi variabel tersebut di file .env atau di environment " +
                "lalu jalankan seed ulang.",
        );
    }

    return value;
}

/* Seed boleh menimpa data, jadi di production harus eksplisit diizinkan. */
function assertSeedAllowed(): void {
    if (process.env.NODE_ENV !== "production") {
        return;
    }

    if (process.env.ALLOW_SEED_PROD !== "true") {
        fail(
            "NODE_ENV=production. " +
                "Seed menolak berjalan agar data produksi tidak tertimpa. " +
                "Jika tetap diperlukan, jalankan ulang dengan " +
                "ALLOW_SEED_PROD=true.",
        );
    }
}

async function main() {
    assertSeedAllowed();

    const adminPassword = await bcrypt.hash(
        requireSecret("SEED_ADMIN_PASSWORD"),
        10,
    );

    const userPassword = await bcrypt.hash(
        requireSecret("SEED_USER_PASSWORD"),
        10,
    );

    // =========================
    // USER
    // =========================

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

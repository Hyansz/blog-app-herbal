import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    await prisma.herb.createMany({
        data: [
            {
                name: "Kunyit",
                slug: "kunyit",
                latinName: "Curcuma longa",
                category: "Rimpang",
                image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?q=80&w=1200",
                description:
                    "Kunyit adalah tanaman herbal yang kaya kurkumin dan digunakan sebagai obat tradisional.",
                benefits:
                    "Anti inflamasi, meningkatkan imun, menyehatkan pencernaan.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
                name: "Kunyit Putih",
                slug: "kunyit-putih",
                latinName: "Curcuma zedoaria",
                category: "Rimpang",
                image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1200",
                description:
                    "Kunyit putih dikenal sebagai herbal tradisional untuk pencernaan dan antioksidan.",
                benefits: "Membantu mengatasi asam lambung dan anti inflamasi.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
                name: "Jahe",
                slug: "jahe",
                latinName: "Zingiber officinale",
                category: "Rimpang",
                image: "https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?q=80&w=1200",
                description:
                    "Jahe memiliki rasa hangat dan sering digunakan untuk meningkatkan daya tahan tubuh.",
                benefits:
                    "Menghangatkan tubuh, meredakan masuk angin dan batuk.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
                name: "Lengkuas",
                slug: "lengkuas",
                latinName: "Alpinia galanga",
                category: "Rimpang",
                image: "https://images.unsplash.com/photo-1609501676725-7186f734b5f5?q=80&w=1200",
                description:
                    "Lengkuas digunakan sebagai bumbu dapur dan herbal alami.",
                benefits:
                    "Membantu mengatasi peradangan dan menjaga kesehatan tubuh.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
                name: "Kencur",
                slug: "kencur",
                latinName: "Kaempferia galanga",
                category: "Rimpang",
                image: "https://images.unsplash.com/photo-1628773822503-930a7eaecf80?q=80&w=1200",
                description:
                    "Kencur terkenal sebagai bahan jamu tradisional Indonesia.",
                benefits:
                    "Membantu mengatasi pegal linu dan meningkatkan stamina.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
                name: "Temulawak",
                slug: "temulawak",
                latinName: "Curcuma xanthorrhiza",
                category: "Rimpang",
                image: "https://images.unsplash.com/photo-1514996937319-344454492b37?q=80&w=1200",
                description:
                    "Temulawak banyak digunakan untuk menjaga kesehatan hati.",
                benefits: "Meningkatkan nafsu makan dan menjaga fungsi liver.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
            {
                name: "Serai",
                slug: "serai",
                latinName: "Cymbopogon citratus",
                category: "Rimpang",
                image: "https://images.unsplash.com/photo-1603048719539-9ecb4b3b8d9d?q=80&w=1200",
                description:
                    "Serai sering digunakan untuk minuman herbal dan aromaterapi.",
                benefits: "Membantu relaksasi dan meredakan flu.",
                videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
            },
        ],
    });

    console.log("Seed berhasil ditambahkan 🚀");
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

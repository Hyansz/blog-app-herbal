import AppLayout from "./components/AppLayout";
import HomeContent from "./components/HomeContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/categories";

export default async function HomePage() {
    const user = await getCurrentUser();

    const categories = await getCategories();

    /* Hanya kirim kolom yang dipakai HerbList/HerbCard.
       Kolom berat (content, benefits, video, latinName) tidak
       perlu ikut ke payload RSC halaman daftar. */
    const herbs = await prisma.article.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            description: true,

            category: {
                select: {
                    name: true,
                },
            },
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <AppLayout user={user} categories={categories} activeMenu="/">
            <HomeContent herbs={herbs} />
        </AppLayout>
    );
}

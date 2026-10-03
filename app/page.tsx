import AppLayout from "./components/AppLayout";
import HomeContent from "./components/HomeContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/categories";

export default async function HomePage() {
    const user = await getCurrentUser();

    const categories = await getCategories();

    const herbs = await prisma.article.findMany({
        include: {
            category: true,
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

import { notFound } from "next/navigation";

import AppLayout from "../components/AppLayout";
import CategoryContent from "../components/CategoryContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/categories";

interface Props {
    params: Promise<{
        category: string;
    }>;
}

export default async function CategoryPage({ params }: Props) {
    const { category: slug } = await params;

    const category = await prisma.category.findUnique({
        where: {
            slug,
        },
    });

    if (!category) {
        notFound();
    }

    const herbs = await prisma.article.findMany({
        where: {
            categoryId: category.id,
        },

        include: {
            category: true,
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    const [user, categories] = await Promise.all([
        getCurrentUser(),
        getCategories(),
    ]);

    return (
        <AppLayout
            user={user}
            categories={categories}
            activeMenu={`/${category.slug}`}
        >
            <CategoryContent title={category.name} herbs={herbs} />
        </AppLayout>
    );
}

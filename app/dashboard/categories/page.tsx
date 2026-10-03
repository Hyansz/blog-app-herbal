import AppLayout from "@/app/components/AppLayout";
import CategoriesContent from "./CategoriesContent";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCategories } from "@/lib/categories";

async function getSidebarCategories() {
    return getCategories();
}

async function getUser() {
    return getCurrentUser();
}

export default async function CategoriesPage() {
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: "desc" },
    });

    const sidebarCategories = await getSidebarCategories();

    const user = await getUser();

    return (
        <AppLayout
            user={user}
            categories={sidebarCategories}
            activeMenu="/dashboard/categories"
        >
            <CategoriesContent categories={categories} />
        </AppLayout>
    );
}

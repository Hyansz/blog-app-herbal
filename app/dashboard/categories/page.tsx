import Link from "next/link";

import AppLayout from "@/app/components/AppLayout";
import CategoriesContent from "./CategoriesContent";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getCategories() {
    return prisma.category.findMany({
        orderBy: { createdAt: "desc" },
    });
}

async function getUser() {
    return getCurrentUser();
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    const user = await getUser();

    return (
        <AppLayout user={user} activeMenu="/dashboard/categories">
            <CategoriesContent categories={categories} />
        </AppLayout>
    );
}

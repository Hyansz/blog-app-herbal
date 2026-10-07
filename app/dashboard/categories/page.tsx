import AppLayout from "@/app/components/AppLayout";
import CategoriesContent from "./CategoriesContent";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getUser() {
    return getCurrentUser();
}

export default async function CategoriesPage() {
    /* Sidebar dan tabel memakai tabel yang sama, sebelumnya di-query
       dua kali (desc + asc). Sekarang satu query, urutan asc untuk
       sidebar diturunkan di memori. */
    const categories = await prisma.category.findMany({
        orderBy: { createdAt: "desc" },
    });

    const sidebarCategories = [...categories].sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    );

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

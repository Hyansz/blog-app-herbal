import { unstable_cache } from "next/cache";

import { prisma } from "@/lib/prisma";

/* Kategori jarang berubah dan datanya kecil, tetapi sebelum ini
   setiap render halaman melakukan query baru. Hasilnya di-cache 60
   detik dan otomatis di-invalidate oleh revalidatePath("/", "layout")
   pada mutasi di /api/categories. */
const getCachedCategories = unstable_cache(
    async () => {
        return prisma.category.findMany({
            orderBy: {
                createdAt: "asc",
            },
        });
    },
    ["sidebar-categories"],
    {
        revalidate: 60,
        tags: ["categories"],
    },
);

export async function getCategories() {
    return getCachedCategories();
}

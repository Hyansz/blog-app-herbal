import { prisma } from "@/lib/prisma";

export async function getCategories() {
    return prisma.category.findMany({
        orderBy: {
            createdAt: "asc",
        },
    });
}

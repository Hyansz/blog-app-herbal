import AppLayout from "../components/AppLayout";
import RimpangContent from "../components/RimpangContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function RimpangPage() {
    const user = await getCurrentUser();

    const herbs = await prisma.article.findMany({
        where: {
            category: {
                slug: "rimpang",
            },
        },

        include: {
            category: true,
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <AppLayout user={user} activeMenu="/rimpang">
            <RimpangContent herbs={herbs} />
        </AppLayout>
    );
}

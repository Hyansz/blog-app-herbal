import AppLayout from "../components/AppLayout";
import TipsContent from "../components/TipsContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function TipsPage() {
    const user = await getCurrentUser();

    const herbs = await prisma.article.findMany({
        where: {
            category: {
                slug: "tips-sehat",
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
        <AppLayout user={user} activeMenu="/tips">
            <TipsContent herbs={herbs} />
        </AppLayout>
    );
}

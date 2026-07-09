import AppLayout from "../components/AppLayout";
import DaunContent from "../components/DaunContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function DaunPage() {
    const user = await getCurrentUser();

    const daun = await prisma.article.findMany({
        where: {
            category: {
                slug: "daun",
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
        <AppLayout user={user} activeMenu="/daun">
            <DaunContent herbs={daun} />
        </AppLayout>
    );
}

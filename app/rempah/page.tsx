import AppLayout from "../components/AppLayout";
import RempahContent from "../components/RempahContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function RempahPage() {
    const user = await getCurrentUser();

    const herbs = await prisma.article.findMany({
        where: {
            category: {
                slug: "rempah",
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
        <AppLayout user={user} activeMenu="/rempah">
            <RempahContent herbs={herbs} />
        </AppLayout>
    );
}

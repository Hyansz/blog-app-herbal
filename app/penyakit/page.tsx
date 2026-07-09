import AppLayout from "../components/AppLayout";
import PenyakitContent from "../components/PenyakitContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function PenyakitPage() {
    const user = await getCurrentUser();

    const herbs = await prisma.article.findMany({
        where: {
            category: {
                slug: "penyakit",
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
        <AppLayout user={user} activeMenu="/penyakit">
            <PenyakitContent herbs={herbs} />
        </AppLayout>
    );
}

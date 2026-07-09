import AppLayout from "../components/AppLayout";
import InformasiContent from "../components/InformasiContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function InformasiPage() {
    const user = await getCurrentUser();

    const herbs = await prisma.article.findMany({
        where: {
            category: {
                slug: "informasi",
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
        <AppLayout user={user} activeMenu="/informasi">
            <InformasiContent herbs={herbs} />
        </AppLayout>
    );
}

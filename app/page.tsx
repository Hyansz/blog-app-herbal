import AppLayout from "./components/AppLayout";
import HomeContent from "./components/HomeContent";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
    const user = await getCurrentUser();

    const herbs = await prisma.article.findMany({
        include: {
            category: true,
        },

        orderBy: {
            createdAt: "desc",
        },
    });

    return (
        <AppLayout user={user} activeMenu="/">
            <HomeContent herbs={herbs} />
        </AppLayout>
    );
}

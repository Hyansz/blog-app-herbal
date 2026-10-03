import AppLayout from "@/app/components/AppLayout";

import ForumPage from "@/app/components/forum/ForumPage";
import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/categories";

async function getUser() {
    return getCurrentUser();
}

export default async function Forum() {
    const user = await getUser();

    const categories = await getCategories();

    return (
        <AppLayout user={user} categories={categories} activeMenu="/forum">
            <ForumPage user={user} />
        </AppLayout>
    );
}

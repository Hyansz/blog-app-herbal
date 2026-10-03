import AppLayout from "@/app/components/AppLayout";
import ArticlesContent from "./ArticlesContent";

import { getCurrentUser } from "@/lib/auth";
import { getCategories } from "@/lib/categories";

export default async function ArticlesPage() {
    const user = await getCurrentUser();

    const categories = await getCategories();

    return (
        <AppLayout
            user={user}
            categories={categories}
            activeMenu="/dashboard/articles"
        >
            <ArticlesContent />
        </AppLayout>
    );
}

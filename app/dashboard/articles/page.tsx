import AppLayout from "@/app/components/AppLayout";
import ArticlesContent from "./ArticlesContent";

import { getCurrentUser } from "@/lib/auth";

export default async function ArticlesPage() {
    const user = await getCurrentUser();

    return (
        <AppLayout user={user} activeMenu="/dashboard/articles">
            <ArticlesContent />
        </AppLayout>
    );
}

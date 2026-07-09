import AppLayout from "@/app/components/AppLayout";

import ForumPage from "@/app/components/forum/ForumPage";
import { getCurrentUser } from "@/lib/auth";

async function getUser() {
    return getCurrentUser();
}

export default async function Forum() {
    const user = await getUser();

    return (
        <AppLayout user={user} activeMenu="/forum">
            <ForumPage user={user} />
        </AppLayout>
    );
}

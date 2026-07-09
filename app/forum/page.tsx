import { cookies } from "next/headers";

import AppLayout from "@/app/components/AppLayout";

import ForumPage from "@/app/components/forum/ForumPage";

async function getUser() {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    try {
        const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/me`, {
            headers: {
                Cookie: `token=${token}`,
            },

            cache: "no-store",
        });

        if (!res.ok) return null;

        return res.json();
    } catch {
        return null;
    }
}

export default async function Forum() {
    const user = await getUser();

    return (
        <AppLayout user={user} activeMenu="/forum">
            <ForumPage user={user} />
        </AppLayout>
    );
}

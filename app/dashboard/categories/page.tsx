import Link from "next/link";
import { cookies } from "next/headers";

import AppLayout from "@/app/components/AppLayout";
import CategoriesContent from "./CategoriesContent";

async function getCategories() {
    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/categories`, {
        cache: "no-store",
    });

    return res.json();
}

async function getUser() {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/me`, {
        headers: {
            Cookie: `token=${token}`,
        },
        cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
}

export default async function CategoriesPage() {
    const categories = await getCategories();

    const user = await getUser();

    return (
        <AppLayout user={user} activeMenu="/dashboard/categories">
            <CategoriesContent categories={categories} />
        </AppLayout>
    );
}

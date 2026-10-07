import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import slugify from "slugify";

export const dynamic = "force-dynamic";

export async function GET() {
    const categories = await prisma.category.findMany({
        orderBy: {
            id: "desc",
        },
    });

    return NextResponse.json(categories, {
        headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
        },
    });
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                {
                    message: "Forbidden",
                },
                {
                    status: 403,
                },
            );
        }

        const body = await req.json();

        const category = await prisma.category.create({
            data: {
                name: body.name,
                slug: slugify(body.name, {
                    lower: true,
                }),
            },
        });

        revalidatePath("/", "layout");

        return NextResponse.json(category);
    } catch {
        return NextResponse.json(
            {
                message: "Gagal membuat kategori",
            },
            {
                status: 500,
            },
        );
    }
}
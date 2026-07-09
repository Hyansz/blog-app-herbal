import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";

export async function GET() {
    const categories = await prisma.category.findMany({
        orderBy: {
            id: "desc",
        },
    });

    return NextResponse.json(categories);
}

export async function POST(req: Request) {
    const body = await req.json();

    const category = await prisma.category.create({
        data: {
            name: body.name,
            slug: slugify(body.name, {
                lower: true,
            }),
        },
    });

    return NextResponse.json(category);
}

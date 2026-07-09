import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { validateProfanity } from "@/lib/profanity";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const check = validateProfanity(body.content);

        if (!check.ok) {
            return NextResponse.json(
                {
                    message: check.message,
                },
                {
                    status: 400,
                },
            );
        }

        const slug = slugify(body.name, {
            lower: true,
            strict: true,
        });

        const article = await prisma.article.create({
            data: {
                name: body.name,
                slug,
                latinName: body.latinName,
                image: body.image,
                description: body.description,
                benefits: body.benefits,
                content: body.content,
                video1: body.video1 || null,
                video2: body.video2 || null,
                categoryId: body.categoryId,
                authorId: body.authorId,
            },
        });

        return NextResponse.json(article);
    } catch {
        return NextResponse.json(
            {
                message: "Gagal membuat artikel",
            },
            {
                status: 500,
            },
        );
    }
}

export async function GET() {
    try {
        const articles = await prisma.article.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                description: true,

                category: {
                    select: {
                        name: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(articles);
    } catch {
        return NextResponse.json([]);
    }
}

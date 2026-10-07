import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { validateProfanity } from "@/lib/profanity";
import {
    deriveDescription,
    htmlToPlainText,
    sanitizeContent,
} from "@/lib/content";

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

        /* HTML dari client tidak pernah disimpan apa adanya:
           selalu lewat sanitasi allowlist di server. */
        const content = sanitizeContent(
            typeof body.content === "string" ? body.content : "",
        );

        const plainText = htmlToPlainText(content);

        if (!plainText) {
            return NextResponse.json(
                {
                    message: "Konten artikel tidak boleh kosong",
                },
                {
                    status: 400,
                },
            );
        }

        /* Profanity dicek pada teks polos, bukan HTML mentah. */
        const check = validateProfanity(plainText);

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

        /* authorId diambil dari sesi, bukan body.
           authorId kiriman client sengaja diabaikan.
           description diisi otomatis dari teks polos konten;
           description kiriman client diabaikan. */
        const article = await prisma.article.create({
            data: {
                name: body.name,
                slug,
                latinName: body.latinName,
                image: body.image,
                description: deriveDescription(plainText),
                benefits: "",
                content,
                video1: body.video1 || null,
                video2: body.video2 || null,
                categoryId: body.categoryId,
                authorId: user.id,
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

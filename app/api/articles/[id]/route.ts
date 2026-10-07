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

interface Props {
    params: Promise<{
        id: string;
    }>;
}

/* Prisma P2025 = operasi gagal karena record yang dibutuhkan
   tidak ditemukan. Dipetakan ke 404, bukan 500. */
function isRecordMissing(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        (error as { code?: string }).code === "P2025"
    );
}

// GET DETAIL ARTICLE
export async function GET(req: Request, { params }: Props) {
    const { id } = await params;

    /* author di-select eksplisit supaya hash password tidak
       ikut terkirim ke client. */
    const article = await prisma.article.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            latinName: true,
            image: true,
            description: true,
            benefits: true,
            content: true,
            video1: true,
            video2: true,
            categoryId: true,
            authorId: true,
            createdAt: true,

            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            author: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
        },
    });

    if (!article) {
        return NextResponse.json(
            {
                message: "Artikel tidak ditemukan",
            },
            {
                status: 404,
            },
        );
    }

    return NextResponse.json(article);
}

// UPDATE ARTICLE
export async function PUT(req: Request, { params }: Props) {
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

        const { id } = await params;

        const exists = await prisma.article.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        if (!exists) {
            return NextResponse.json(
                {
                    message: "Artikel tidak ditemukan",
                },
                {
                    status: 404,
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

        const article = await prisma.article.update({
            where: {
                id,
            },
            data: {
                name: body.name,
                slug,

                latinName: body.latinName,
                image: body.image,

                /* description diisi otomatis dari teks polos konten;
                   description kiriman client diabaikan. */
                description: deriveDescription(plainText),
                benefits: "",
                content,

                video1: body.video1 || null,
                video2: body.video2 || null,

                categoryId: body.categoryId,
            },
        });

        return NextResponse.json(article);
    } catch (error) {
        /* P2025 = "An operation failed because it depends on one or
           more records that were required but not found" -> 404. */
        if (isRecordMissing(error)) {
            return NextResponse.json(
                {
                    message: "Artikel tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        console.error(error);

        return NextResponse.json(
            {
                message: "Gagal update artikel",
            },
            {
                status: 500,
            },
        );
    }
}

// DELETE ARTICLE
export async function DELETE(req: Request, { params }: Props) {
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

        const { id } = await params;

        const exists = await prisma.article.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        if (!exists) {
            return NextResponse.json(
                {
                    message: "Artikel tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.article.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            message: "Artikel berhasil dihapus",
        });
    } catch (error) {
        if (isRecordMissing(error)) {
            return NextResponse.json(
                {
                    message: "Artikel tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        console.error(error);

        return NextResponse.json(
            {
                message: "Gagal menghapus artikel",
            },
            {
                status: 500,
            },
        );
    }
}

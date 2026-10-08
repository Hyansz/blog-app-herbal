import { NextRequest, NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";

import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    context: {
        params: Promise<{
            id: string;
        }>;
    },
) {
    try {
        const { id } = await context.params;

        const comments = await prisma.articleComment.findMany({
            where: {
                articleId: id,
            },

            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(comments);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Gagal mengambil komentar",
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(
    req: NextRequest,
    context: {
        params: Promise<{
            id: string;
        }>;
    },
) {
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

        const { id } = await context.params;

        const body = await req.json();

        const { content } = body;

        if (!content?.trim()) {
            return NextResponse.json(
                {
                    message: "Komentar wajib diisi",
                },
                {
                    status: 400,
                },
            );
        }

        /* authorId diambil dari sesi, tidak pernah dari body.
           Adapter Neon HTTP tidak mendukung transaksi, jadi
           `create` dengan `include` gagal "Transactions are not
           supported in HTTP mode": tulis tanpa `include`,
           baca ulang dengan bentuk respon yang sama. */
        const comment = await prisma.articleComment.create({
            data: {
                content,

                articleId: id,

                authorId: user.id,
            },
        });

        const detail = await prisma.articleComment.findUnique({
            where: {
                id: comment.id,
            },

            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    },
                },
            },
        });

        return NextResponse.json(detail ?? comment);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Gagal membuat komentar",
            },
            {
                status: 500,
            },
        );
    }
}

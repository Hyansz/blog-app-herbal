import { NextRequest, NextResponse } from "next/server";

import { cookies } from "next/headers";

import jwt from "jsonwebtoken";

import { prisma } from "@/lib/prisma";

interface TokenPayload {
    id: string;
    role: string;
}

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
        const cookieStore = await cookies();

        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                {
                    status: 401,
                },
            );
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as TokenPayload;

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

        const { id } = await context.params;

        const comment = await prisma.articleComment.create({
            data: {
                content,

                articleId: id,

                authorId: decoded.id,
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

        return NextResponse.json(comment);
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

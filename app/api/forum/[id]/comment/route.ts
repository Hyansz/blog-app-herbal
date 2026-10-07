import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";

import { validateProfanity } from "@/lib/profanity";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
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

        const { id } = await params;

        const body = await req.json();

        const content = body.content;

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

        const check = validateProfanity(content);

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

        const post = await prisma.forumPost.findUnique({
            where: {
                id,
            },

            select: {
                id: true,
            },
        });

        if (!post) {
            return NextResponse.json(
                {
                    message: "Diskusi tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        const comment = await prisma.forumComment.create({
            data: {
                content,

                postId: id,

                authorId: user.id,
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
                message: "Server error",
            },
            {
                status: 500,
            },
        );
    }
}
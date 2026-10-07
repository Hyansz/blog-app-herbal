import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";

import { validateProfanity } from "@/lib/profanity";

export const dynamic = "force-dynamic";

export async function GET() {
    const posts = await prisma.forumPost.findMany({
        orderBy: {
            createdAt: "desc",
        },

        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
            comments: {
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
                    createdAt: "asc",
                },
            },
            likes: {
                select: {
                    id: true,
                },
            },
        },
    });

    return NextResponse.json(posts);
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

        const body = await req.json();

        const content = body.content;

        if (!content?.trim()) {
            return NextResponse.json(
                {
                    message: "Konten wajib diisi",
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

        const post = await prisma.forumPost.create({
            data: {
                content,

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
                comments: {
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
                        createdAt: "asc",
                    },
                },
                likes: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        return NextResponse.json(post);
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
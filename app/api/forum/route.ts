import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";

import { validateProfanity } from "@/lib/profanity";

export const dynamic = "force-dynamic";

/* Adapter Neon HTTP (PrismaNeonHTTP) tidak mendukung transaksi.
   Setiap `create`/`update` yang memakai `include` dibungkus
   transaksi implisit dan gagal dengan "Transactions are not
   supported in HTTP mode". Karena itu tulis tanpa `include`,
   lalu baca ulang dengan bentuk respon yang sama. */
const POST_INCLUDE = {
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
            createdAt: "asc" as const,
        },
    },
    likes: {
        select: {
            id: true,
        },
    },
};

export async function GET() {
    /* likedByMe dihitung di server dari sesi yang sedang login —
       tidak pernah dipercaya dari userId milik client. Tamu
       selalu false. */
    const user = await getCurrentUser();

    const posts = await prisma.forumPost.findMany({
        orderBy: {
            createdAt: "desc",
        },

        include: POST_INCLUDE,
    });

    const likedPostIds = new Set<string>();

    if (user) {
        const likes = await prisma.forumLike.findMany({
            where: {
                userId: user.id,
            },

            select: {
                postId: true,
            },
        });

        for (const like of likes) likedPostIds.add(like.postId);
    }

    return NextResponse.json(
        posts.map((post) => ({
            ...post,
            likedByMe: likedPostIds.has(post.id),
        })),
    );
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
        });

        const detail = await prisma.forumPost.findUnique({
            where: {
                id: post.id,
            },

            include: POST_INCLUDE,
        });

        return NextResponse.json(detail ?? post);
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
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

        const existing = await prisma.forumLike.findUnique({
            where: {
                postId_userId: {
                    postId: id,

                    userId: user.id,
                },
            },
        });

        if (existing) {
            await prisma.forumLike.delete({
                where: {
                    id: existing.id,
                },
            });

            return NextResponse.json({ liked: false });
        }

        await prisma.forumLike.create({
            data: {
                postId: id,

                userId: user.id,
            },
        });

        return NextResponse.json({ liked: true });
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
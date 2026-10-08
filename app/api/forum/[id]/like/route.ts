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

        /* Body opsional { liked: true|false } membuat endpoint ini
           idempoten: keadaan akhir ditentukan client, bukan toggle
           buta, sehingga klik beruntun tidak menghasilkan hitungan
           yang salah. Tanpa body tetap toggle (kompatibel lama). */
        const body = await req.json().catch(() => null);

        const desired =
            body && typeof body.liked === "boolean" ? body.liked : null;

        const existing = await prisma.forumLike.findUnique({
            where: {
                postId_userId: {
                    postId: id,

                    userId: user.id,
                },
            },
        });

        const shouldLike = desired === null ? !existing : desired;

        if (shouldLike && !existing) {
            await prisma.forumLike.create({
                data: {
                    postId: id,

                    userId: user.id,
                },
            });
        } else if (!shouldLike && existing) {
            await prisma.forumLike.delete({
                where: {
                    id: existing.id,
                },
            });
        }

        const likeCount = await prisma.forumLike.count({
            where: {
                postId: id,
            },
        });

        return NextResponse.json({
            liked: shouldLike,
            likeCount,
        });
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

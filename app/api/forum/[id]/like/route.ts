import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { cookies } from "next/headers";

import jwt from "jsonwebtoken";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params;

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

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const existing = await prisma.forumLike.findUnique({
        where: {
            postId_userId: {
                postId: id,
                userId: decoded.id,
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
            userId: decoded.id,
        },
    });

    return NextResponse.json({ liked: true });
}

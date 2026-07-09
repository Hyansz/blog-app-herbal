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

    const body = await req.json();

    const comment = await prisma.forumComment.create({
        data: {
            content: body.content,
            postId: id,
            authorId: decoded.id,
        },

        include: {
            author: true,
        },
    });

    return NextResponse.json(comment);
}

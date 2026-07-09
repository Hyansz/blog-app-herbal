import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { validateProfanity } from "@/lib/profanity";
import jwt from "jsonwebtoken";

export async function GET() {
    const posts = await prisma.forumPost.findMany({
        orderBy: {
            createdAt: "desc",
        },

        include: {
            author: true,
            comments: {
                include: {
                    author: true,
                },

                orderBy: {
                    createdAt: "asc",
                },
            },
            likes: true,
        },
    });

    return NextResponse.json(posts);
}

export async function POST(req: Request) {
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

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        const body = await req.json();

        const check = validateProfanity(body.content);

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
                content: body.content,
                authorId: decoded.id,
            },

            include: {
                author: true,
                comments: true,
                likes: true,
            },
        });

        return NextResponse.json(post);
    } catch (error) {
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

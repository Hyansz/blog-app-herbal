import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";

import { validateProfanity } from "@/lib/profanity";

/* Adapter Neon HTTP tidak mendukung transaksi, sehingga
   `update` dengan `include` gagal "Transactions are not
   supported in HTTP mode". Update tanpa `include`, lalu
   baca ulang dengan bentuk respon yang sama. */
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

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;

        const body = await req.json();

        const content = body.content;

        if (!content?.trim()) {
            return NextResponse.json(
                { message: "Konten wajib diisi" },
                { status: 400 },
            );
        }

        const check = validateProfanity(content);

        if (!check.ok) {
            return NextResponse.json(
                { message: check.message },
                { status: 400 },
            );
        }

        const post = await prisma.forumPost.findUnique({
            where: {
                id,
            },

            select: {
                id: true,
                authorId: true,
            },
        });

        if (!post) {
            return NextResponse.json(
                { message: "Diskusi tidak ditemukan" },
                { status: 404 },
            );
        }

        if (user.role !== "ADMIN" && post.authorId !== user.id) {
            return NextResponse.json(
                { message: "Kamu tidak memiliki akses untuk mengubah diskusi ini" },
                { status: 403 },
            );
        }

        await prisma.forumPost.update({
            where: {
                id,
            },

            data: {
                content,
            },
        });

        const updated = await prisma.forumPost.findUnique({
            where: {
                id,
            },

            include: POST_INCLUDE,
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 },
        );
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { id } = await params;

        const post = await prisma.forumPost.findUnique({
            where: {
                id,
            },

            select: {
                id: true,
                authorId: true,
            },
        });

        if (!post) {
            return NextResponse.json(
                { message: "Diskusi tidak ditemukan" },
                { status: 404 },
            );
        }

        if (user.role !== "ADMIN" && post.authorId !== user.id) {
            return NextResponse.json(
                { message: "Kamu tidak memiliki akses untuk menghapus diskusi ini" },
                { status: 403 },
            );
        }

        await prisma.forumPost.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({ message: "Diskusi berhasil dihapus" });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 },
        );
    }
}
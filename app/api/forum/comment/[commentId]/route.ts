import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";

import { validateProfanity } from "@/lib/profanity";

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ commentId: string }> },
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { commentId } = await params;

        const body = await req.json();

        const content = body.content;

        if (!content?.trim()) {
            return NextResponse.json(
                { message: "Komentar wajib diisi" },
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

        const comment = await prisma.forumComment.findUnique({
            where: {
                id: commentId,
            },

            select: {
                id: true,
                authorId: true,
            },
        });

        if (!comment) {
            return NextResponse.json(
                { message: "Komentar tidak ditemukan" },
                { status: 404 },
            );
        }

        if (user.role !== "ADMIN" && comment.authorId !== user.id) {
            return NextResponse.json(
                {
                    message:
                        "Kamu tidak memiliki akses untuk mengubah komentar ini",
                },
                { status: 403 },
            );
        }

        /* Adapter Neon HTTP tidak mendukung transaksi: `update`
           dengan `include` gagal "Transactions are not supported
           in HTTP mode". Update tanpa `include`, baca ulang. */
        await prisma.forumComment.update({
            where: {
                id: commentId,
            },

            data: {
                content,
            },
        });

        const updated = await prisma.forumComment.findUnique({
            where: {
                id: commentId,
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
    { params }: { params: Promise<{ commentId: string }> },
) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 },
            );
        }

        const { commentId } = await params;

        const comment = await prisma.forumComment.findUnique({
            where: {
                id: commentId,
            },

            select: {
                id: true,
                authorId: true,
            },
        });

        if (!comment) {
            return NextResponse.json(
                { message: "Komentar tidak ditemukan" },
                { status: 404 },
            );
        }

        if (user.role !== "ADMIN" && comment.authorId !== user.id) {
            return NextResponse.json(
                {
                    message:
                        "Kamu tidak memiliki akses untuk menghapus komentar ini",
                },
                { status: 403 },
            );
        }

        await prisma.forumComment.delete({
            where: {
                id: commentId,
            },
        });

        return NextResponse.json({ message: "Komentar berhasil dihapus" });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            { message: "Server error" },
            { status: 500 },
        );
    }
}
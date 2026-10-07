import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

interface Params {
    params: Promise<{
        id: string;
    }>;
}

/* Prisma P2025 = operasi gagal karena record yang dibutuhkan
   tidak ditemukan. Dipetakan ke 404, bukan 500. */
function isRecordMissing(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        (error as { code?: string }).code === "P2025"
    );
}

/* =========================
   UPDATE CATEGORY

   Slug sengaja TIDAK di-generate ulang.
   Slug hanya dibuat saat create (POST /api/categories) agar URL
   kategori dan relasi artikel tidak rusak saat nama diubah.
========================= */
export async function PUT(req: Request, { params }: Params) {
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

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                {
                    message: "Forbidden",
                },
                {
                    status: 403,
                },
            );
        }

        const { id } = await params;

        const exists = await prisma.category.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        if (!exists) {
            return NextResponse.json(
                {
                    message: "Kategori tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        const body = await req.json();

        const category = await prisma.category.update({
            where: {
                id,
            },
            data: {
                name: body.name,
            },
        });

        revalidatePath("/", "layout");

        return NextResponse.json(category);
    } catch (error) {
        if (isRecordMissing(error)) {
            return NextResponse.json(
                {
                    message: "Kategori tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        console.error(error);

        return NextResponse.json(
            {
                message: "Gagal update kategori",
            },
            {
                status: 500,
            },
        );
    }
}

/* =========================
   DELETE CATEGORY
========================= */
export async function DELETE(req: Request, { params }: Params) {
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

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                {
                    message: "Forbidden",
                },
                {
                    status: 403,
                },
            );
        }

        const { id } = await params;

        const exists = await prisma.category.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });

        if (!exists) {
            return NextResponse.json(
                {
                    message: "Kategori tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.category.delete({
            where: {
                id,
            },
        });

        revalidatePath("/", "layout");

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        if (isRecordMissing(error)) {
            return NextResponse.json(
                {
                    message: "Kategori tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        console.error(error);

        return NextResponse.json(
            {
                message: "Gagal hapus kategori",
            },
            {
                status: 500,
            },
        );
    }
}

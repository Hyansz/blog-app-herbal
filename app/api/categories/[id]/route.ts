import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface Params {
    params: Promise<{
        id: string;
    }>;
}

/* =========================
   UPDATE CATEGORY
========================= */
export async function PUT(req: Request, { params }: Params) {
    try {
        const body = await req.json();

        const { id } = await params;

        const category = await prisma.category.update({
            where: {
                id,
            },
            data: {
                name: body.name,
                slug: body.name.toLowerCase().replace(/\s+/g, "-"),
            },
        });

        return NextResponse.json(category);
    } catch (error) {
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
        const { id } = await params;

        await prisma.category.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
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

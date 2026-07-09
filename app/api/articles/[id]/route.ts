import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import slugify from "slugify";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

// GET DETAIL ARTICLE
export async function GET(req: Request, { params }: Props) {
    const { id } = await params;

    const article = await prisma.article.findUnique({
        where: {
            id,
        },
        include: {
            category: true,
            author: true,
        },
    });

    if (!article) {
        return NextResponse.json(
            {
                message: "Artikel tidak ditemukan",
            },
            {
                status: 404,
            },
        );
    }

    return NextResponse.json(article);
}

// UPDATE ARTICLE
export async function PUT(req: Request, { params }: Props) {
    try {
        const { id } = await params;

        const body = await req.json();

        const slug = slugify(body.name, {
            lower: true,
            strict: true,
        });

        const article = await prisma.article.update({
            where: {
                id,
            },
            data: {
                name: body.name,
                slug,

                latinName: body.latinName,
                image: body.image,

                description: body.description,
                benefits: body.benefits,
                content: body.content,

                video1: body.video1 || null,
                video2: body.video2 || null,

                categoryId: body.categoryId,
            },
        });

        return NextResponse.json(article);
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Gagal update artikel",
            },
            {
                status: 500,
            },
        );
    }
}

// DELETE ARTICLE
export async function DELETE(req: Request, { params }: Props) {
    try {
        const { id } = await params;

        await prisma.article.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            message: "Artikel berhasil dihapus",
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                message: "Gagal menghapus artikel",
            },
            {
                status: 500,
            },
        );
    }
}

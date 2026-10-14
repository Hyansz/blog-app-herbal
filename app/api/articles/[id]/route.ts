import { prisma, prismaErrorCode } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import slugify from "slugify";
import { validateProfanity } from "@/lib/profanity";
import {
    deriveDescription,
    htmlToPlainText,
    sanitizeContent,
} from "@/lib/content";

interface Props {
    params: Promise<{
        id: string;
    }>;
}

// GET DETAIL ARTICLE
export async function GET(req: Request, { params }: Props) {
    const { id } = await params;

    /* author di-select eksplisit supaya hash password tidak
       ikut terkirim ke client. */
    const article = await prisma.article.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            name: true,
            slug: true,
            latinName: true,
            image: true,
            description: true,
            benefits: true,
            content: true,
            video1: true,
            video2: true,
            categoryId: true,
            authorId: true,
            createdAt: true,

            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                },
            },

            author: {
                select: {
                    id: true,
                    name: true,
                    role: true,
                },
            },
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
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    message: "Silakan login terlebih dahulu",
                },
                {
                    status: 401,
                },
            );
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                {
                    message: "Hanya admin yang boleh mengubah artikel",
                },
                {
                    status: 403,
                },
            );
        }

        const { id } = await params;

        const exists = await prisma.article.findUnique({
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
                    message: "Artikel tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        const body = await req.json().catch(() => null);

        if (!body || typeof body !== "object") {
            return NextResponse.json(
                {
                    message: "Data artikel tidak valid",
                },
                {
                    status: 400,
                },
            );
        }

        const name = typeof body.name === "string" ? body.name.trim() : "";

        if (!name) {
            return NextResponse.json(
                {
                    message: "Nama artikel wajib diisi",
                },
                {
                    status: 400,
                },
            );
        }

        const image = typeof body.image === "string" ? body.image.trim() : "";

        if (!image) {
            return NextResponse.json(
                {
                    message: "Gambar sampul wajib diunggah",
                },
                {
                    status: 400,
                },
            );
        }

        const categoryId =
            typeof body.categoryId === "string" ? body.categoryId.trim() : "";

        if (!categoryId) {
            return NextResponse.json(
                {
                    message: "Kategori wajib dipilih",
                },
                {
                    status: 400,
                },
            );
        }

        /* HTML dari client tidak pernah disimpan apa adanya:
           selalu lewat sanitasi allowlist di server. */
        const content = sanitizeContent(
            typeof body.content === "string" ? body.content : "",
        );

        const plainText = htmlToPlainText(content);

        if (!plainText) {
            return NextResponse.json(
                {
                    message: "Konten artikel tidak boleh kosong",
                },
                {
                    status: 400,
                },
            );
        }

        /* Profanity dicek pada teks polos, bukan HTML mentah. */
        const check = validateProfanity(plainText);

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

        const slug = slugify(name, {
            lower: true,
            strict: true,
        });

        const article = await prisma.article.update({
            where: {
                id,
            },
            data: {
                name,
                slug,

                latinName:
                    typeof body.latinName === "string" ? body.latinName : null,
                image,

                /* description diisi otomatis dari teks polos konten;
                   description kiriman client diabaikan. */
                description: deriveDescription(plainText),
                benefits: "",
                content,

                video1:
                    typeof body.video1 === "string" && body.video1
                        ? body.video1
                        : null,
                video2:
                    typeof body.video2 === "string" && body.video2
                        ? body.video2
                        : null,

                categoryId,
            },
        });

        return NextResponse.json(article);
    } catch (error) {
        /* P2025 = artikel hilang saat update -> 404.
           P2002 = slug (judul) duplikat -> 409.
           P2003 = kategori tidak ada -> 400. */
        const code = prismaErrorCode(error);

        if (code === "P2025") {
            return NextResponse.json(
                {
                    message: "Artikel tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        if (code === "P2002") {
            return NextResponse.json(
                {
                    message:
                        "Judul artikel sudah dipakai. Gunakan judul lain.",
                },
                {
                    status: 409,
                },
            );
        }

        if (code === "P2003") {
            return NextResponse.json(
                {
                    message: "Kategori tidak ditemukan",
                },
                {
                    status: 400,
                },
            );
        }

        return NextResponse.json(
            {
                message: "Gagal update artikel. Coba lagi.",
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
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                {
                    message: "Silakan login terlebih dahulu",
                },
                {
                    status: 401,
                },
            );
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                {
                    message: "Hanya admin yang boleh menghapus artikel",
                },
                {
                    status: 403,
                },
            );
        }

        const { id } = await params;

        const exists = await prisma.article.findUnique({
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
                    message: "Artikel tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        await prisma.article.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            message: "Artikel berhasil dihapus",
        });
    } catch (error) {
        if (prismaErrorCode(error) === "P2025") {
            return NextResponse.json(
                {
                    message: "Artikel tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        return NextResponse.json(
            {
                message: "Gagal menghapus artikel. Coba lagi.",
            },
            {
                status: 500,
            },
        );
    }
}

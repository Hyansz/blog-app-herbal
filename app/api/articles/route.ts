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

export async function POST(req: Request) {
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
                    message: "Hanya admin yang boleh menambah artikel",
                },
                {
                    status: 403,
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

        /* authorId diambil dari sesi, bukan body.
           authorId kiriman client sengaja diabaikan.
           description diisi otomatis dari teks polos konten;
           description kiriman client diabaikan. */
        const article = await prisma.article.create({
            data: {
                name,
                slug,
                latinName:
                    typeof body.latinName === "string" ? body.latinName : null,
                image,
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
                authorId: user.id,
            },
        });

        return NextResponse.json(article);
    } catch (error) {
        /* P2002 = slug (judul) duplikat -> 409.
           P2003 = kategori tidak ada -> 400. */
        const code = prismaErrorCode(error);

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
                message: "Gagal membuat artikel. Coba lagi.",
            },
            {
                status: 500,
            },
        );
    }
}

export async function GET() {
    try {
        const articles = await prisma.article.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                image: true,
                description: true,

                category: {
                    select: {
                        name: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(articles);
    } catch {
        return NextResponse.json([]);
    }
}

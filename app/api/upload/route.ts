import cloudinary from "@/lib/cloudinary";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
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

        const formData = await req.formData();

        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json(
                {
                    message: "File tidak ditemukan",
                },
                {
                    status: 400,
                },
            );
        }

        const bytes = await file.arrayBuffer();

        const buffer = Buffer.from(bytes);

        const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

        const result = await cloudinary.uploader.upload(base64, {
            resource_type: "auto",
            folder: "jamoe-djawa",

            /* Kirim format & kualitas terbaik yang didukung browser,
               bukan file asli. URL hasil sudah memuat transformasi
               sehingga aman dipakai next/image. */
            transformation: [
                {
                    quality: "auto",
                    fetch_format: "auto",
                },
            ],
        });

        return NextResponse.json({
            url: result.secure_url,
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                message: "Upload gagal",
            },
            {
                status: 500,
            },
        );
    }
}

import cloudinary from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
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

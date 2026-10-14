import crypto from "crypto";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

/* Batas ukuran yang sama dengan batas akun Cloudinary. */
const MAX_BYTES = 100 * 1024 * 1024;

const FOLDER = "jamoe-djawa";
const TRANSFORMATION = "q_auto,f_auto";

/* Tanda tangan Cloudinary: parameter diurutkan -> "k=v&k=v"
   -> tambahkan api_secret -> sha1 hex. api_secret tidak pernah
   dikirim ke client, hanya hasil hash-nya. */
function sign(params: Record<string, string>, apiSecret: string) {
    const query = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");

    return crypto.createHash("sha1").update(query + apiSecret).digest("hex");
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { message: "Silakan login terlebih dahulu" },
                { status: 401 },
            );
        }

        if (user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Hanya admin yang boleh mengunggah media" },
                { status: 403 },
            );
        }

        const body = await req.json().catch(() => null);

        const size = typeof body?.size === "number" ? body.size : 0;

        if (!Number.isFinite(size) || size <= 0) {
            return NextResponse.json(
                { message: "File tidak valid" },
                { status: 400 },
            );
        }

        if (size > MAX_BYTES) {
            return NextResponse.json(
                { message: "Ukuran file maksimal 100 MB" },
                { status: 400 },
            );
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json(
                { message: "Konfigurasi penyimpanan media belum lengkap" },
                { status: 500 },
            );
        }

        const timestamp = Math.floor(Date.now() / 1000);

        const params = {
            folder: FOLDER,
            timestamp: String(timestamp),
            transformation: TRANSFORMATION,
        };

        return NextResponse.json({
            url: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
            apiKey,
            timestamp,
            signature: sign(params, apiSecret),
            folder: FOLDER,
            transformation: TRANSFORMATION,
        });
    } catch {
        return NextResponse.json(
            { message: "Gagal menyiapkan unggahan. Coba lagi." },
            { status: 500 },
        );
    }
}

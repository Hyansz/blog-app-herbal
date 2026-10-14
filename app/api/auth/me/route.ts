import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

/* Status login tidak boleh di-cache browser: respons sebelum login
   (null) jangan sampai dipakai ulang setelah login. */
const NO_STORE = { "Cache-Control": "private, no-store" };

export async function GET() {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(null, {
                headers: NO_STORE,
            });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            name: string;
            role: string;
        };

        /* `id` wajib ikut dikirim: halaman tambah artikel
           memeriksa user.id sebelum mengirim form. */
        return NextResponse.json(
            {
                id: user.id,
                name: user.name,
                role: user.role,
            },
            {
                headers: NO_STORE,
            },
        );
    } catch {
        return NextResponse.json(null, {
            headers: NO_STORE,
        });
    }
}

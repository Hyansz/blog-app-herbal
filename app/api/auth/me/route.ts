import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const cookieStore = cookies();

        const token = (await cookieStore).get("token")?.value;

        if (!token) {
            return NextResponse.json(null, {
                headers: {
                    "Cache-Control": "private, max-age=300",
                },
            });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET!) as {
            name: string;
            role: string;
        };

        return NextResponse.json(
            {
                name: user.name,
                role: user.role,
            },
            {
                headers: {
                    "Cache-Control": "private, max-age=300",
                },
            },
        );
    } catch {
        return NextResponse.json(null);
    }
}

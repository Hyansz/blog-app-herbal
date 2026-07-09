import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    message: "User tidak ditemukan",
                },
                {
                    status: 404,
                },
            );
        }

        const isValid = await bcrypt.compare(body.password, user.password);

        if (!isValid) {
            return NextResponse.json(
                {
                    message: "Password salah",
                },
                {
                    status: 401,
                },
            );
        }

        const token = jwt.sign(
            {
                id: user.id,
                name: user.name,
                role: user.role,
            },
            process.env.JWT_SECRET!,
            {
                expiresIn: "7d",
            },
        );

        const response = NextResponse.json({
            message: "Login berhasil",
            user: {
                name: user.name,
                role: user.role,
            },
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
        });

        return response;
    } catch (error) {
        return NextResponse.json(
            {
                message: "Terjadi kesalahan",
            },
            {
                status: 500,
            },
        );
    }
}

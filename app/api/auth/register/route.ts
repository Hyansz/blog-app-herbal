import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const existingUser = await prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    message: "Email sudah digunakan",
                },
                {
                    status: 400,
                },
            );
        }

        const hashedPassword = await bcrypt.hash(body.password, 10);

        const user = await prisma.user.create({
            data: {
                name: body.name,
                email: body.email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({
            message: "Register berhasil",
            user,
        });
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

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> },
) {
    try {
        const { id } = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 },
            );
        }

        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        if (decoded.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Only admin can delete discussions" },
                { status: 403 },
            );
        }

        await prisma.forumPost.delete({ where: { id } });

        return NextResponse.json({ message: "Diskusi berhasil dihapus" });
    } catch (error) {
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 },
        );
    }
}

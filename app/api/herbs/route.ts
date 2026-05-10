import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
    const herbs = await prisma.herb.findMany();

    return NextResponse.json(herbs);
}

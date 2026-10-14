import { PrismaClient } from "@prisma/client";
import { PrismaNeonHTTP } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL!;
    const adapter = new PrismaNeonHTTP(connectionString, {
        arrayMode: false,
        fullResults: false,
    });
    return new PrismaClient({ adapter, log: ["error"] });
}

export const prisma =
    globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}

/* Ambil kode error Prisma (P2002, P2003, P2025, ...) dari error apa pun
   tanpa memakai `any` — dipakai route untuk memetakan pesan ramah. */
export function prismaErrorCode(error: unknown): string | null {
    if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        typeof (error as { code?: unknown }).code === "string"
    ) {
        return (error as { code: string }).code;
    }

    return null;
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { prisma } from "@/lib/prisma";

/* ============================================================
   Rate limit login
   Maksimal 5 kegagalan per kombinasi IP + email dalam 15 menit.

   Implementasi in-memory (Map) tanpa library tambahan, dilengkapi
   pembersihan entri yang sudah kedaluwarsa agar memori tidak
   membengkak.

   CATATAN (serverless / Vercel): penyimpanan in-memory seperti ini
   hanya best-effort per instance. Tiap instance fungsi memiliki Map
   sendiri dan di-reset pada cold start, sehingga hitungan bisa tidak
   konsisten antar instance. Untuk perlindungan penuh, logika
   penghitungan ini perlu dipindahkan ke penyimpanan terpusat yang
   dibagikan oleh semua instance, misalnya Upstash Redis.
   ============================================================ */

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const SWEEP_INTERVAL_MS = 60 * 1000;

interface LoginAttempt {
    count: number;
    /* Batas akhir jendela hitung (epoch ms). */
    resetAt: number;
}

const attempts = new Map<string, LoginAttempt>();

let lastSweepAt = 0;

/* Buang entri yang jendelanya sudah lewat. */
function pruneExpired(now: number): void {
    if (attempts.size === 0) return;
    if (now - lastSweepAt < SWEEP_INTERVAL_MS) return;

    lastSweepAt = now;

    for (const [key, attempt] of attempts) {
        if (attempt.resetAt <= now) {
            attempts.delete(key);
        }
    }
}

function clientIp(req: Request): string {
    const forwarded = req.headers.get("x-forwarded-for");

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    return req.headers.get("x-real-ip") ?? "unknown";
}

function rateLimitKey(req: Request, email: unknown): string {
    return `${clientIp(req)}|${String(email ?? "").toLowerCase()}`;
}

/* Sisa waktu kunci dalam detik, null bila tidak sedang dibatasi. */
function retryAfterSeconds(key: string, now: number): number | null {
    const attempt = attempts.get(key);

    if (!attempt || attempt.count < MAX_FAILURES) return null;

    const remaining = attempt.resetAt - now;

    if (remaining <= 0) return null;

    return Math.max(1, Math.ceil(remaining / 1000));
}

function recordFailure(key: string, now: number): void {
    const attempt = attempts.get(key);

    if (!attempt || attempt.resetAt <= now) {
        attempts.set(key, {
            count: 1,
            resetAt: now + WINDOW_MS,
        });
        return;
    }

    attempt.count += 1;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const now = Date.now();

        pruneExpired(now);

        const key = rateLimitKey(req, body.email);
        const retryAfter = retryAfterSeconds(key, now);

        if (retryAfter !== null) {
            return NextResponse.json(
                {
                    message: "Terlalu banyak percobaan, coba lagi nanti",
                },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(retryAfter),
                    },
                },
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });

        const isValid =
            user !== null &&
            (await bcrypt.compare(body.password, user.password));

        if (!isValid) {
            recordFailure(key, now);

            /* Pesan sengaja dibuat sama untuk email tidak dikenal dan
               password salah, supaya keberadaan akun tidak bocor. */
            return NextResponse.json(
                {
                    message: "Email atau password salah",
                },
                {
                    status: 401,
                },
            );
        }

        /* Login berhasil: hapus hitungan percobaan. */
        attempts.delete(key);

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

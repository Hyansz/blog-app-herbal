import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface TokenPayload {
    id?: string;
    name: string;
    role: string;
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();

        const token = cookieStore.get("token")?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!,
        ) as TokenPayload;

        return {
            id: decoded.id,
            name: decoded.name,
            role: decoded.role,
        };
    } catch {
        return null;
    }
}

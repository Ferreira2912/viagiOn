import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "viagion-super-secret-key-change-me-in-production"
);

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(SECRET_KEY);
}

export async function decrypt(token: string) {
    try {
        const { payload } = await jwtVerify(token, SECRET_KEY);
        return payload;
    } catch {
        return null;
    }
}

export async function getSession() {
    const cookieStore = await cookies();
    const session = cookieStore.get("viagion_session")?.value;
    if (!session) return null;
    return await decrypt(session);
}

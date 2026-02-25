import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decrypt } from "./lib/auth";

const PUBLIC_ROUTES = ["/login", "/registro"];

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

    const cookie = request.cookies.get("viagion_session")?.value;
    const session = cookie ? await decrypt(cookie) : null;

    // Not authenticated → send to login (except public routes)
    if (!session && !isPublic) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Already authenticated → skip login/registro pages
    if (session && isPublic) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)"],
};

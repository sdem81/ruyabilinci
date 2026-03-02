import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const LOGIN_PATH = "/admin/login";
const COOKIE_NAME = "admin_token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /admin/login sayfasına her zaman izin ver
  if (pathname.startsWith(LOGIN_PATH)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  // Token yoksa veya secret ayarlanmamışsa → login'e yönlendir
  if (!token || !secret) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  try {
    // jose ile JWT doğrula — Edge Runtime uyumlu
    await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.next();
  } catch {
    // Token süresi dolmuş veya geçersizse → login'e yönlendir
    const response = NextResponse.redirect(new URL(LOGIN_PATH, request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }
}

export const config = {
  // Sadece /admin altındaki tüm rotaları koru
  matcher: ["/admin/:path*"],
};

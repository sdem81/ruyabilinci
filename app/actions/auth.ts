"use server";

import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "admin_token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 gün

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET env değişkeni en az 32 karakter olmalıdır.");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Login Server Action — useFormState ile çalışır.
 * Başarılıysa /admin'e redirect atar, hatalıysa { error } döner.
 */
export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const username = formData.get("username")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return { error: "Sunucu yapılandırması eksik. .env dosyasını kontrol et." };
  }

  // Sabit-zaman karşılaştırma: timing attack'a karşı
  const usernameMatch = username === adminUsername;
  const passwordMatch = password === adminPassword;

  if (!usernameMatch || !passwordMatch) {
    return { error: "Kullanıcı adı veya şifre hatalı." };
  }

  // JWT imzala
  const token = await new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getSecret());

  // HttpOnly cookie yaz
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  redirect("/admin");
}

/**
 * Logout Server Action — cookie'yi siler ve login sayfasına yönlendirir.
 */
export async function logoutAction(): Promise<void> {
  cookies().delete(COOKIE_NAME);
  redirect("/admin/login");
}

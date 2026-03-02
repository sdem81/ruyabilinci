"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/app/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-dream px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-dream-dark focus:outline-none focus:ring-2 focus:ring-dream/30 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
    </button>
  );
}

const initialState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo / Başlık */}
        <div className="mb-8 text-center">
          <span className="text-4xl">🌙</span>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Admin Girişi</h1>
          <p className="mt-1 text-sm text-gray-500">Rüya Tabirleri Yönetim Paneli</p>
        </div>

        {/* Hata mesajı */}
        {state.error && (
          <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {state.error}
          </div>
        )}

        <form action={formAction} className="space-y-4">
          {/* Kullanıcı adı */}
          <div>
            <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-700">
              Kullanıcı Adı
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              autoFocus
              autoComplete="username"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-dream focus:ring-2 focus:ring-dream/20"
              placeholder="admin"
            />
          </div>

          {/* Şifre */}
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
              Şifre
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-dream focus:ring-2 focus:ring-dream/20"
              placeholder="••••••••"
            />
          </div>

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}

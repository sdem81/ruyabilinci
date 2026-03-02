"use client";

import { useState } from "react";

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Lütfen ad, e-posta ve mesaj alanlarını doldurun.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Mesaj gönderilemedi. Lütfen tekrar deneyin.");
        return;
      }

      setSuccess("Mesajınız alındı. En kısa sürede size dönüş yapacağız.");
      setForm(initialForm);
    } catch {
      setError("Bağlantı hatası oluştu. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-10 rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900">İletişim Formu</h2>
      <p className="mt-2 text-sm text-gray-600">
        Aşağıdaki formu doldurarak bize doğrudan mesaj gönderebilirsiniz.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Ad Soyad *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={onChange}
            className="input-field"
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
            E-posta *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="input-field"
            required
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700">
          Konu
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={onChange}
          className="input-field"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
          Mesaj *
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          value={form.message}
          onChange={onChange}
          className="input-field"
          required
        />
      </div>

      <button type="submit" disabled={loading} className="btn-primary mt-5 disabled:opacity-70">
        {loading ? "Gönderiliyor..." : "Mesajı Gönder"}
      </button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

export default function YeniMusteriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    code: "",
    name: "",
    taxNumber: "",
    taxOffice: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    contactPerson: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/satis/musteriler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      router.push("/satis/musteriler");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Müşteri" description="Yeni müşteri kaydı oluşturun" />

      <form onSubmit={handleSubmit} className="card p-6 space-y-6 max-w-3xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Müşteri Kodu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="MUS-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Müşteri Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="input-field w-full"
              placeholder="Firma adı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">Vergi Numarası</label>
            <input
              type="text"
              name="taxNumber"
              value={form.taxNumber}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">Vergi Dairesi</label>
            <input
              type="text"
              name="taxOffice"
              value={form.taxOffice}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Vergi dairesi adı"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">Şehir</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="İstanbul"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">Telefon</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="0212 123 45 67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">E-posta</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="info@firma.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">Yetkili Kişi</label>
            <input
              type="text"
              name="contactPerson"
              value={form.contactPerson}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Ad Soyad"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-shell mb-1">Adres</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            className="input-field w-full"
            placeholder="Açık adres"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/satis/musteriler")}
            className="btn-secondary"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}

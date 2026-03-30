"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

interface Category {
  id: string;
  name: string;
}

const BIRIMLER = [
  { value: "ADET", label: "Adet" },
  { value: "KG", label: "Kilogram (Kg)" },
  { value: "LT", label: "Litre (Lt)" },
  { value: "MT", label: "Metre (Mt)" },
];

export default function YeniUrunPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    sku: "",
    name: "",
    description: "",
    categoryId: "",
    unit: "ADET",
    purchasePrice: "",
    salePrice: "",
    taxRate: "18",
  });

  useEffect(() => {
    fetch("/api/stok/kategoriler")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/stok/urunler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      router.push("/stok/urunler");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Ürün" description="Yeni ürün kaydı oluşturun" />

      <form onSubmit={handleSubmit} className="card p-6 max-w-2xl">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              SKU Kodu *
            </label>
            <input
              type="text"
              name="sku"
              value={form.sku}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="URN-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Ürün Adı *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Ürün adını girin"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-shell mb-1">
              Açıklama
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Ürün açıklaması"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Kategori
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Kategori seçin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Birim *
            </label>
            <select
              name="unit"
              value={form.unit}
              onChange={handleChange}
              required
              className="input-field"
            >
              {BIRIMLER.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Alış Fiyatı
            </label>
            <input
              type="number"
              name="purchasePrice"
              value={form.purchasePrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              Satış Fiyatı
            </label>
            <input
              type="number"
              name="salePrice"
              value={form.salePrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="input-field"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-shell mb-1">
              KDV Oranı (%)
            </label>
            <input
              type="number"
              name="taxRate"
              value={form.taxRate}
              onChange={handleChange}
              step="1"
              min="0"
              max="100"
              className="input-field"
              placeholder="18"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-fiori-border">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/stok/urunler")}
            className="btn-secondary"
          >
            Vazgeç
          </button>
        </div>
      </form>
    </div>
  );
}

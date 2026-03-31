"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

interface BOM {
  id: string;
  bomNo: string;
  product: { name: string };
}

export default function YeniUretimEmriPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [boms, setBoms] = useState<BOM[]>([]);

  const [form, setForm] = useState({
    orderNo: "",
    bomId: "",
    quantity: 1,
    plannedStart: "",
    plannedEnd: "",
    priority: "NORMAL",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/uretim/receteler")
      .then((r) => r.json())
      .then(setBoms)
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/uretim/emirler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      router.push("/uretim/emirler");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Üretim Emri" description="Yeni üretim emri oluşturun" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-shell mb-4">Üretim Emri Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Emir No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="orderNo"
                value={form.orderNo}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="UE-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Ürün Reçetesi (BOM) <span className="text-red-500">*</span>
              </label>
              <select
                name="bomId"
                value={form.bomId}
                onChange={handleChange}
                required
                className="input-field w-full"
              >
                <option value="">Reçete seçin</option>
                {boms.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.product.name} - {b.bomNo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Miktar <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                step="1"
                value={form.quantity}
                onChange={handleChange}
                required
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Öncelik <span className="text-red-500">*</span>
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                required
                className="input-field w-full"
              >
                <option value="DUSUK">Düşük</option>
                <option value="NORMAL">Normal</option>
                <option value="YUKSEK">Yüksek</option>
                <option value="ACIL">Acil</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Planlanan Başlangıç <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="plannedStart"
                value={form.plannedStart}
                onChange={handleChange}
                required
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Planlanan Bitiş <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="plannedEnd"
                value={form.plannedEnd}
                onChange={handleChange}
                required
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-shell mb-1">Notlar</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              className="input-field w-full"
              placeholder="Üretim emri ile ilgili notlar..."
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/uretim/emirler")}
            className="btn-secondary"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}

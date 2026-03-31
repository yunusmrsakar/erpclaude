"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface BOMItem {
  materialId: string;
  quantity: number;
  unit: string;
  wastageRate: number;
}

export default function YeniRecetePage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [bomNo, setBomNo] = useState("");
  const [productId, setProductId] = useState("");
  const [version, setVersion] = useState("1.0");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<BOMItem[]>([
    { materialId: "", quantity: 1, unit: "Adet", wastageRate: 0 },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/stok/urunler")
      .then((r) => r.json())
      .then(setProducts);
  }, []);

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    (updated[index] as unknown as Record<string, unknown>)[field] = value;
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { materialId: "", quantity: 1, unit: "Adet", wastageRate: 0 }]);

  const removeItem = (i: number) =>
    items.length > 1 && setItems(items.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bomNo || !productId || items.some((item) => !item.materialId)) {
      return alert("Lütfen tüm zorunlu alanları doldurun");
    }
    setSubmitting(true);
    await fetch("/api/uretim/receteler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bomNo, productId, version, notes, items }),
    });
    router.push("/uretim/receteler");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Ürün Reçetesi (BOM)" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Reçete No *</label>
            <input
              className="input-field"
              value={bomNo}
              onChange={(e) => setBomNo(e.target.value)}
              placeholder="BOM-001"
              required
            />
          </div>
          <div>
            <label className="label">Ürün *</label>
            <select
              className="input-field"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Ürün seçiniz</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Versiyon</label>
            <input
              className="input-field"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="1.0"
            />
          </div>
          <div>
            <label className="label">Notlar</label>
            <textarea
              className="input-field"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Reçete ile ilgili notlar..."
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-fiori-border flex items-center justify-between">
            <h2 className="font-semibold text-shell">Malzeme Listesi</h2>
            <button type="button" onClick={addItem} className="btn-primary text-sm">
              + Malzeme Ekle
            </button>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Malzeme</th>
                <th>Miktar</th>
                <th>Birim</th>
                <th>Fire Oranı (%)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <select
                      className="input-field"
                      value={item.materialId}
                      onChange={(e) => updateItem(i, "materialId", e.target.value)}
                    >
                      <option value="">Malzeme seçiniz</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.sku} - {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input-field w-24"
                      min={0.01}
                      step={0.01}
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      className="input-field w-24"
                      value={item.unit}
                      onChange={(e) => updateItem(i, "unit", e.target.value)}
                      placeholder="Adet"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="input-field w-24"
                      min={0}
                      step={0.1}
                      value={item.wastageRate}
                      onChange={(e) => updateItem(i, "wastageRate", Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-fiori-red text-sm hover:underline"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Kaydediliyor..." : "Reçeteyi Oluştur"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface ProductionOrder {
  id: string;
  orderNo: string;
}

interface InspectionItem {
  parameter: string;
  standard: string;
  actual: string;
  result: string;
}

export default function YeniKaliteKontrolPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [productionOrders, setProductionOrders] = useState<ProductionOrder[]>([]);
  const [inspectionNo, setInspectionNo] = useState("");
  const [productId, setProductId] = useState("");
  const [productionOrderId, setProductionOrderId] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [sampleSize, setSampleSize] = useState(1);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<InspectionItem[]>([
    { parameter: "", standard: "", actual: "", result: "BEKLEMEDE" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/stok/urunler")
      .then((r) => r.json())
      .then(setProducts);
    fetch("/api/uretim/emirler")
      .then((r) => r.json())
      .then(setProductionOrders)
      .catch(() => setProductionOrders([]));
  }, []);

  const updateItem = (index: number, field: keyof InspectionItem, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { parameter: "", standard: "", actual: "", result: "BEKLEMEDE" }]);

  const removeItem = (i: number) =>
    items.length > 1 && setItems(items.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !inspectorName || !inspectionNo) {
      return alert("Lütfen zorunlu alanları doldurun");
    }
    setSubmitting(true);
    await fetch("/api/kalite/kontroller", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inspectionNo,
        productId,
        productionOrderId: productionOrderId || null,
        inspectorName,
        date,
        sampleSize,
        notes,
        items,
      }),
    });
    router.push("/kalite/kontroller");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Kalite Kontrolü" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="label">Kontrol No *</label>
            <input
              type="text"
              className="input-field"
              value={inspectionNo}
              onChange={(e) => setInspectionNo(e.target.value)}
              placeholder="KK-001"
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
              <option value="">Seçiniz</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sku} - {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Üretim Emri</label>
            <select
              className="input-field"
              value={productionOrderId}
              onChange={(e) => setProductionOrderId(e.target.value)}
            >
              <option value="">Seçiniz (Opsiyonel)</option>
              {productionOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.orderNo}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Kontrol Eden *</label>
            <input
              type="text"
              className="input-field"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              placeholder="Ad Soyad"
              required
            />
          </div>
          <div>
            <label className="label">Tarih *</label>
            <input
              type="date"
              className="input-field"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Numune Adedi</label>
            <input
              type="number"
              className="input-field"
              min={1}
              value={sampleSize}
              onChange={(e) => setSampleSize(Number(e.target.value))}
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notlar</label>
            <textarea
              className="input-field"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ek notlar..."
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-fiori-border flex items-center justify-between">
            <h2 className="font-semibold text-shell">Kontrol Parametreleri</h2>
            <button type="button" onClick={addItem} className="btn-primary text-sm">
              + Parametre Ekle
            </button>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Parametre</th>
                <th>Standart</th>
                <th>Gerçekleşen</th>
                <th>Sonuç</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      className="input-field"
                      value={item.parameter}
                      onChange={(e) => updateItem(i, "parameter", e.target.value)}
                      placeholder="Parametre adı"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="input-field"
                      value={item.standard}
                      onChange={(e) => updateItem(i, "standard", e.target.value)}
                      placeholder="Beklenen değer"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="input-field"
                      value={item.actual}
                      onChange={(e) => updateItem(i, "actual", e.target.value)}
                      placeholder="Ölçülen değer"
                    />
                  </td>
                  <td>
                    <select
                      className="input-field"
                      value={item.result}
                      onChange={(e) => updateItem(i, "result", e.target.value)}
                    >
                      <option value="BEKLEMEDE">Beklemede</option>
                      <option value="GECTI">Geçti</option>
                      <option value="KALDI">Kaldı</option>
                    </select>
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
            {submitting ? "Kaydediliyor..." : "Kontrolü Kaydet"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}

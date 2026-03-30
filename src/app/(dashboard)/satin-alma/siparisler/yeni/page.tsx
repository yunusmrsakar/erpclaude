"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { formatPara } from "@/lib/format";

interface Supplier { id: string; name: string; code: string }
interface Product { id: string; name: string; sku: string; purchasePrice: number; taxRate: number }
interface Line { productId: string; productName: string; quantity: number; unitPrice: number; taxRate: number; total: number }

export default function YeniSatinAlmaSiparisPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([{ productId: "", productName: "", quantity: 1, unitPrice: 0, taxRate: 20, total: 0 }]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/satin-alma/tedarikciler").then((r) => r.json()).then(setSuppliers);
    fetch("/api/stok/urunler").then((r) => r.json()).then(setProducts);
  }, []);

  const updateLine = (index: number, field: string, value: string | number) => {
    const updated = [...lines];
    (updated[index] as unknown as Record<string, unknown>)[field] = value;
    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      if (product) {
        updated[index].unitPrice = product.purchasePrice;
        updated[index].taxRate = product.taxRate;
        updated[index].productName = product.name;
      }
    }
    const qty = updated[index].quantity;
    const price = updated[index].unitPrice;
    const tax = updated[index].taxRate;
    updated[index].total = qty * price * (1 + tax / 100);
    setLines(updated);
  };

  const addLine = () => setLines([...lines, { productId: "", productName: "", quantity: 1, unitPrice: 0, taxRate: 20, total: 0 }]);
  const removeLine = (i: number) => lines.length > 1 && setLines(lines.filter((_, idx) => idx !== i));

  const subtotal = lines.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const taxAmount = lines.reduce((s, l) => s + l.quantity * l.unitPrice * (l.taxRate / 100), 0);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || lines.some((l) => !l.productId)) return alert("Lütfen tüm alanları doldurun");
    setSubmitting(true);
    const orderNo = `SAT-${Date.now().toString().slice(-6)}`;
    await fetch("/api/satin-alma/siparisler", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNo, supplierId, date, notes, subtotal, taxAmount, total, lines }),
    });
    router.push("/satin-alma/siparisler");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Satın Alma Siparişi" />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Tedarikçi *</label>
            <select className="input-field" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
              <option value="">Seçiniz</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Tarih *</label>
            <input type="date" className="input-field" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label">Notlar</label>
            <input className="input-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-fiori-border flex items-center justify-between">
            <h2 className="font-semibold text-shell">Sipariş Kalemleri</h2>
            <button type="button" onClick={addLine} className="btn-primary text-sm">+ Kalem Ekle</button>
          </div>
          <table className="w-full data-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Miktar</th>
                <th>Birim Fiyat</th>
                <th>KDV %</th>
                <th>Toplam</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line, i) => (
                <tr key={i}>
                  <td>
                    <select className="input-field" value={line.productId} onChange={(e) => updateLine(i, "productId", e.target.value)}>
                      <option value="">Ürün seçiniz</option>
                      {products.map((p) => <option key={p.id} value={p.id}>{p.sku} - {p.name}</option>)}
                    </select>
                  </td>
                  <td><input type="number" className="input-field w-24" min={1} value={line.quantity} onChange={(e) => updateLine(i, "quantity", Number(e.target.value))} /></td>
                  <td><input type="number" className="input-field w-32" min={0} step={0.01} value={line.unitPrice} onChange={(e) => updateLine(i, "unitPrice", Number(e.target.value))} /></td>
                  <td><input type="number" className="input-field w-20" min={0} value={line.taxRate} onChange={(e) => updateLine(i, "taxRate", Number(e.target.value))} /></td>
                  <td className="font-medium">{formatPara(line.total)}</td>
                  <td><button type="button" onClick={() => removeLine(i)} className="text-fiori-red text-sm hover:underline">Sil</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-5 py-4 border-t border-fiori-border text-right space-y-1">
            <p className="text-sm text-fiori-neutral">Ara Toplam: {formatPara(subtotal)}</p>
            <p className="text-sm text-fiori-neutral">KDV: {formatPara(taxAmount)}</p>
            <p className="text-lg font-bold text-shell">Genel Toplam: {formatPara(total)}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={submitting} className="btn-primary">{submitting ? "Kaydediliyor..." : "Siparişi Oluştur"}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">İptal</button>
        </div>
      </form>
    </div>
  );
}

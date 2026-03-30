"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { formatPara } from "@/lib/format";

interface Customer {
  id: string;
  code: string;
  name: string;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  salePrice?: number;
}

interface OrderLine {
  productId: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

const emptyLine: OrderLine = {
  productId: "",
  quantity: 1,
  unitPrice: 0,
  taxRate: 20,
};

export default function YeniSiparisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [form, setForm] = useState({
    orderNo: "",
    customerId: "",
    date: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    notes: "",
  });

  const [lines, setLines] = useState<OrderLine[]>([{ ...emptyLine }]);

  useEffect(() => {
    fetch("/api/satis/musteriler")
      .then((r) => r.json())
      .then(setCustomers)
      .catch(() => {});

    fetch("/api/stok/urunler")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLineChange = (
    index: number,
    field: keyof OrderLine,
    value: string | number
  ) => {
    setLines((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // Ürün seçildiğinde fiyatı otomatik doldur
      if (field === "productId") {
        const product = products.find((p) => p.id === value);
        if (product?.salePrice) {
          updated[index].unitPrice = product.salePrice;
        }
      }

      return updated;
    });
  };

  const addLine = () => {
    setLines((prev) => [...prev, { ...emptyLine }]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const getLineTotal = (line: OrderLine) => {
    return line.quantity * line.unitPrice;
  };

  const getLineTax = (line: OrderLine) => {
    return line.quantity * line.unitPrice * (line.taxRate / 100);
  };

  const subtotal = lines.reduce((sum, line) => sum + getLineTotal(line), 0);
  const taxAmount = lines.reduce((sum, line) => sum + getLineTax(line), 0);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const invalidLines = lines.some((l) => !l.productId || l.quantity <= 0 || l.unitPrice <= 0);
    if (invalidLines) {
      setError("Tüm kalem satırlarını eksiksiz doldurun");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/satis/siparisler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lines }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      router.push("/satis/siparisler");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Yeni Satış Siparişi" description="Yeni sipariş oluşturun" />

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        {/* Başlık Bilgileri */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-shell mb-4">Sipariş Bilgileri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Sipariş No <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="orderNo"
                value={form.orderNo}
                onChange={handleChange}
                required
                className="input-field w-full"
                placeholder="SIP-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Müşteri <span className="text-red-500">*</span>
              </label>
              <select
                name="customerId"
                value={form.customerId}
                onChange={handleChange}
                required
                className="input-field w-full"
              >
                <option value="">Müşteri seçin</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Sipariş Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="input-field w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">Teslimat Tarihi</label>
              <input
                type="date"
                name="deliveryDate"
                value={form.deliveryDate}
                onChange={handleChange}
                className="input-field w-full"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-shell mb-1">Notlar</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              className="input-field w-full"
              placeholder="Sipariş ile ilgili notlar..."
            />
          </div>
        </div>

        {/* Kalem Satırları */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-shell">Sipariş Kalemleri</h2>
            <button type="button" onClick={addLine} className="btn-secondary flex items-center gap-1 text-sm">
              <Plus size={14} />
              Kalem Ekle
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th className="w-28">Miktar</th>
                  <th className="w-36">Birim Fiyat</th>
                  <th className="w-28">KDV %</th>
                  <th className="w-36">Tutar</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td>
                      <select
                        value={line.productId}
                        onChange={(e) => handleLineChange(index, "productId", e.target.value)}
                        className="input-field w-full"
                      >
                        <option value="">Ürün seçin</option>
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
                        min="0.01"
                        step="0.01"
                        value={line.quantity}
                        onChange={(e) => handleLineChange(index, "quantity", parseFloat(e.target.value) || 0)}
                        className="input-field w-full text-right"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unitPrice}
                        onChange={(e) => handleLineChange(index, "unitPrice", parseFloat(e.target.value) || 0)}
                        className="input-field w-full text-right"
                      />
                    </td>
                    <td>
                      <select
                        value={line.taxRate}
                        onChange={(e) => handleLineChange(index, "taxRate", parseInt(e.target.value))}
                        className="input-field w-full"
                      >
                        <option value={0}>%0</option>
                        <option value={1}>%1</option>
                        <option value={10}>%10</option>
                        <option value={20}>%20</option>
                      </select>
                    </td>
                    <td className="text-right font-medium">
                      {formatPara(getLineTotal(line))}
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        disabled={lines.length <= 1}
                        className="p-1.5 rounded hover:bg-red-50 text-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Toplamlar */}
          <div className="flex justify-end mt-4">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-fiori-neutral">Ara Toplam:</span>
                <span className="font-medium">{formatPara(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-fiori-neutral">KDV Toplam:</span>
                <span className="font-medium">{formatPara(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold border-t border-fiori-border pt-2">
                <span>Genel Toplam:</span>
                <span>{formatPara(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/satis/siparisler")}
            className="btn-secondary"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}

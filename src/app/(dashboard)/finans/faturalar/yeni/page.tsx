"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { formatPara } from "@/lib/format";

interface Party {
  id: string;
  code: string;
  name: string;
}

interface InvoiceLine {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export default function YeniFaturaPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState<"SATIS" | "ALIS">("SATIS");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [partyId, setPartyId] = useState("");
  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const [customers, setCustomers] = useState<Party[]>([]);
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [loadingParties, setLoadingParties] = useState(false);

  const [lines, setLines] = useState<InvoiceLine[]>([
    { description: "", quantity: 1, unitPrice: 0, taxRate: 20 },
  ]);

  // Musteri/tedarikci listelerini yukle
  useEffect(() => {
    setLoadingParties(true);
    setPartyId("");

    if (type === "SATIS") {
      fetch("/api/satis/musteriler")
        .then((r) => r.json())
        .then((data) => setCustomers(Array.isArray(data) ? data : []))
        .catch(() => setCustomers([]))
        .finally(() => setLoadingParties(false));
    } else {
      fetch("/api/satin-alma/tedarikciler")
        .then((r) => r.json())
        .then((data) => setSuppliers(Array.isArray(data) ? data : []))
        .catch(() => setSuppliers([]))
        .finally(() => setLoadingParties(false));
    }
  }, [type]);

  const addLine = () => {
    setLines([
      ...lines,
      { description: "", quantity: 1, unitPrice: 0, taxRate: 20 },
    ]);
  };

  const removeLine = (index: number) => {
    if (lines.length <= 1) return;
    setLines(lines.filter((_, i) => i !== index));
  };

  const updateLine = (
    index: number,
    field: keyof InvoiceLine,
    value: string | number
  ) => {
    const updated = [...lines];
    if (field === "description") {
      updated[index][field] = value as string;
    } else {
      updated[index][field] = Number(value) || 0;
    }
    setLines(updated);
  };

  const calcLineSubtotal = (line: InvoiceLine) =>
    line.quantity * line.unitPrice;
  const calcLineTax = (line: InvoiceLine) =>
    calcLineSubtotal(line) * (line.taxRate / 100);
  const calcLineTotal = (line: InvoiceLine) =>
    calcLineSubtotal(line) + calcLineTax(line);

  const subtotal = lines.reduce((s, l) => s + calcLineSubtotal(l), 0);
  const taxAmount = lines.reduce((s, l) => s + calcLineTax(l), 0);
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasyon
    if (!invoiceNo.trim()) {
      setError("Fatura numarasi zorunludur");
      return;
    }
    if (!partyId) {
      setError(
        type === "SATIS"
          ? "Musteri secimi zorunludur"
          : "Tedarikci secimi zorunludur"
      );
      return;
    }
    if (!date || !dueDate) {
      setError("Tarih ve vade tarihi zorunludur");
      return;
    }
    if (lines.some((l) => !l.description.trim())) {
      setError("Tum kalemlerin aciklamasi doldurulmalidir");
      return;
    }
    if (lines.some((l) => l.quantity <= 0 || l.unitPrice <= 0)) {
      setError("Miktar ve birim fiyat sifirdan buyuk olmalidir");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/finans/faturalar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceNo,
          type,
          customerId: type === "SATIS" ? partyId : undefined,
          supplierId: type === "ALIS" ? partyId : undefined,
          date,
          dueDate,
          notes,
          lines: lines.map((l) => ({
            description: l.description,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            taxRate: l.taxRate,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Fatura olusturulurken hata olustu");
        return;
      }

      router.push("/finans/faturalar");
    } catch {
      setError("Fatura olusturulurken hata olustu");
    } finally {
      setSaving(false);
    }
  };

  const partyList = type === "SATIS" ? customers : suppliers;
  const partyLabel = type === "SATIS" ? "Musteri" : "Tedarikci";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Yeni Fatura"
        description="Satis veya alis faturasi olusturun"
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Genel Bilgiler */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-shell mb-4">
            Fatura Bilgileri
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="label">Fatura Turu</label>
              <select
                className="input-field"
                value={type}
                onChange={(e) =>
                  setType(e.target.value as "SATIS" | "ALIS")
                }
              >
                <option value="SATIS">Satis Faturasi</option>
                <option value="ALIS">Alis Faturasi</option>
              </select>
            </div>
            <div>
              <label className="label">Fatura No</label>
              <input
                type="text"
                className="input-field"
                placeholder="FTR-2026-001"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">{partyLabel}</label>
              {loadingParties ? (
                <div className="input-field flex items-center gap-2 text-fiori-neutral">
                  <Loader2 size={14} className="animate-spin" />
                  Yukleniyor...
                </div>
              ) : (
                <select
                  className="input-field"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  required
                >
                  <option value="">{partyLabel} secin</option>
                  {partyList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="label">Fatura Tarihi</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Vade Tarihi</label>
              <input
                type="date"
                className="input-field"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Notlar</label>
              <input
                type="text"
                className="input-field"
                placeholder="Opsiyonel notlar"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Fatura Kalemleri */}
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-fiori-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-shell">
              Fatura Kalemleri
            </h3>
            <button
              type="button"
              onClick={addLine}
              className="btn-secondary flex items-center gap-1 text-sm"
            >
              <Plus size={14} />
              Satir Ekle
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left min-w-[250px]">
                    Aciklama
                  </th>
                  <th className="px-4 py-3 text-right w-28">Miktar</th>
                  <th className="px-4 py-3 text-right w-36">
                    Birim Fiyat
                  </th>
                  <th className="px-4 py-3 text-right w-24">KDV %</th>
                  <th className="px-4 py-3 text-right w-36">Toplam</th>
                  <th className="px-4 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Urun veya hizmet aciklamasi"
                        value={line.description}
                        onChange={(e) =>
                          updateLine(index, "description", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="input-field text-right"
                        min="0.01"
                        step="0.01"
                        value={line.quantity || ""}
                        onChange={(e) =>
                          updateLine(index, "quantity", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="number"
                        className="input-field text-right"
                        min="0.01"
                        step="0.01"
                        value={line.unitPrice || ""}
                        onChange={(e) =>
                          updateLine(index, "unitPrice", e.target.value)
                        }
                        required
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        className="input-field text-right"
                        value={line.taxRate}
                        onChange={(e) =>
                          updateLine(index, "taxRate", e.target.value)
                        }
                      >
                        <option value={0}>%0</option>
                        <option value={1}>%1</option>
                        <option value={10}>%10</option>
                        <option value={20}>%20</option>
                      </select>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-sm font-semibold text-shell">
                        {formatPara(calcLineTotal(line))}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        disabled={lines.length <= 1}
                        className="p-1.5 rounded text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
          <div className="px-6 py-4 border-t border-fiori-border bg-gray-50">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-8 text-sm">
                <span className="text-fiori-neutral">Ara Toplam:</span>
                <span className="font-medium w-32 text-right">
                  {formatPara(subtotal)}
                </span>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <span className="text-fiori-neutral">KDV Toplami:</span>
                <span className="font-medium w-32 text-right">
                  {formatPara(taxAmount)}
                </span>
              </div>
              <div className="flex items-center gap-8 text-base pt-2 border-t border-fiori-border mt-2">
                <span className="font-semibold text-shell">
                  Genel Toplam:
                </span>
                <span className="font-bold text-shell w-32 text-right">
                  {formatPara(total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Islem Butonlari */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            Fatura Olustur
          </button>
          <button
            type="button"
            onClick={() => router.push("/finans/faturalar")}
            className="btn-secondary"
          >
            Iptal
          </button>
        </div>
      </form>
    </div>
  );
}

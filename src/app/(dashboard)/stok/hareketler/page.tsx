"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatSayi, formatTarih } from "@/lib/format";
import { Plus, X } from "lucide-react";

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  date: string;
  notes: string | null;
  product: { id: string; name: string; sku: string };
  warehouse: { id: string; name: string };
}

interface Product {
  id: string;
  name: string;
  sku: string;
}

interface Warehouse {
  id: string;
  name: string;
}

const HAREKET_TIPLERI = [
  { value: "GIRIS", label: "Giriş" },
  { value: "CIKIS", label: "Çıkış" },
  { value: "TRANSFER", label: "Transfer" },
];

const columns: ColumnDef<StockMovement, unknown>[] = [
  {
    accessorKey: "date",
    header: "Tarih",
    cell: ({ getValue }) => formatTarih(getValue() as string),
  },
  {
    id: "productName",
    header: "Ürün",
    accessorFn: (row) => row.product.name,
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-medium">{row.original.product.name}</p>
        <p className="text-xs text-fiori-neutral">{row.original.product.sku}</p>
      </div>
    ),
  },
  {
    id: "warehouseName",
    header: "Depo",
    accessorFn: (row) => row.warehouse.name,
  },
  {
    accessorKey: "type",
    header: "Hareket Tipi",
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: "quantity",
    header: "Miktar",
    cell: ({ getValue }) => formatSayi(getValue() as number),
  },
  {
    accessorKey: "notes",
    header: "Notlar",
    cell: ({ getValue }) => (getValue() as string) || "-",
  },
];

export default function HareketlerPage() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    productId: "",
    warehouseId: "",
    type: "GIRIS",
    quantity: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/stok/hareketler").then((r) => r.json()),
      fetch("/api/stok/urunler").then((r) => r.json()),
      fetch("/api/stok/depolar").then((r) => r.json()),
    ])
      .then(([movementsData, productsData, warehousesData]) => {
        setMovements(movementsData);
        setProducts(productsData);
        setWarehouses(warehousesData);
      })
      .finally(() => setLoading(false));
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
      const res = await fetch("/api/stok/hareketler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      const newMovement = await res.json();
      setMovements((prev) => [newMovement, ...prev]);
      setForm({
        productId: "",
        warehouseId: "",
        type: "GIRIS",
        quantity: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Stok Hareketleri" description="Giriş, çıkış ve transfer hareketleri" />
        <div className="card p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stok Hareketleri"
        description="Giriş, çıkış ve transfer hareketleri"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Kapat" : "Yeni Hareket"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Ürün *
              </label>
              <select
                name="productId"
                value={form.productId}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Ürün seçin</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.sku})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Depo *
              </label>
              <select
                name="warehouseId"
                value={form.warehouseId}
                onChange={handleChange}
                required
                className="input-field"
              >
                <option value="">Depo seçin</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Hareket Tipi *
              </label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="input-field"
              >
                {HAREKET_TIPLERI.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Miktar *
              </label>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                required
                min="0.01"
                step="0.01"
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Tarih
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Notlar
              </label>
              <input
                type="text"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="input-field"
                placeholder="Açıklama"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="btn-secondary"
            >
              Vazgeç
            </button>
          </div>
        </form>
      )}

      {movements.length === 0 && !showForm ? (
        <EmptyState
          title="Henüz stok hareketi yok"
          description="Yeni bir stok hareketi ekleyerek başlayın."
        />
      ) : (
        movements.length > 0 && (
          <DataTable
            data={movements}
            columns={columns}
            searchPlaceholder="Ürün veya depo ara..."
          />
        )
      )}
    </div>
  );
}

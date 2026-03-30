"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatSayi } from "@/lib/format";
import { Plus, X } from "lucide-react";

interface Warehouse {
  id: string;
  name: string;
  address: string | null;
  isActive: boolean;
  _count: { stockLevels: number };
}

const columns: ColumnDef<Warehouse, unknown>[] = [
  {
    accessorKey: "name",
    header: "Depo Adı",
  },
  {
    accessorKey: "address",
    header: "Adres",
    cell: ({ getValue }) => (getValue() as string) || "-",
  },
  {
    id: "productCount",
    header: "Ürün Sayısı",
    accessorFn: (row) => row._count.stockLevels,
    cell: ({ getValue }) => formatSayi(getValue() as number),
  },
  {
    id: "status",
    header: "Durum",
    accessorFn: (row) => (row.isActive ? "AKTIF" : "PASIF"),
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export default function DepolarPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", address: "" });

  const fetchWarehouses = () => {
    fetch("/api/stok/depolar")
      .then((r) => r.json())
      .then(setWarehouses)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/stok/depolar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Bir hata oluştu");
      }

      const newWarehouse = await res.json();
      setWarehouses((prev) => [newWarehouse, ...prev]);
      setForm({ name: "", address: "" });
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
        <PageHeader title="Depolar" description="Depo listesi ve yönetimi" />
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
        title="Depolar"
        description="Depo listesi ve yönetimi"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Kapat" : "Yeni Depo"}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Depo Adı *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                className="input-field"
                placeholder="Depo adını girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Adres
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="input-field"
                placeholder="Depo adresi"
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

      {warehouses.length === 0 && !showForm ? (
        <EmptyState
          title="Henüz depo eklenmemiş"
          description="Yeni bir depo ekleyerek stok takibine başlayın."
        />
      ) : (
        warehouses.length > 0 && (
          <DataTable
            data={warehouses}
            columns={columns}
            searchPlaceholder="Depo ara..."
          />
        )
      )}
    </div>
  );
}

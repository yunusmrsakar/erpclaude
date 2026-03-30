"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

interface Department {
  id: string;
  name: string;
  isActive: boolean;
  parent: { id: string; name: string } | null;
  _count: { employees: number };
}

const columns: ColumnDef<Department, unknown>[] = [
  {
    accessorKey: "name",
    header: "Departman Adı",
  },
  {
    id: "parent",
    header: "Üst Departman",
    accessorFn: (row) => row.parent?.name || "-",
  },
  {
    id: "employeeCount",
    header: "Çalışan Sayısı",
    accessorFn: (row) => row._count.employees,
  },
  {
    id: "status",
    header: "Durum",
    accessorFn: (row) => (row.isActive ? "AKTIF" : "PASIF"),
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export default function DepartmanlarPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchDepartments = () => {
    fetch("/api/ik/departmanlar")
      .then((r) => r.json())
      .then(setDepartments)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/ik/departmanlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          parentId: formParentId || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Bir hata oluştu.");
        return;
      }

      setFormName("");
      setFormParentId("");
      setShowForm(false);
      fetchDepartments();
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Departmanlar" description="Departman listesi ve yönetimi" />
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
        title="Departmanlar"
        description="Departman listesi ve yönetimi"
        action={
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            Yeni Departman
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4">
          <h3 className="font-semibold text-shell">Yeni Departman Ekle</h3>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Departman Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="input-field w-full"
                placeholder="Örn: Bilgi Teknolojileri"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-shell mb-1">
                Üst Departman
              </label>
              <select
                value={formParentId}
                onChange={(e) => setFormParentId(e.target.value)}
                className="input-field w-full"
              >
                <option value="">Yok (Ana Departman)</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setError("");
              }}
              className="px-4 py-2 text-sm border border-fiori-border rounded-lg hover:bg-gray-50"
            >
              İptal
            </button>
          </div>
        </form>
      )}

      {departments.length === 0 && !showForm ? (
        <EmptyState
          title="Henüz departman yok"
          description="İlk departmanı ekleyerek başlayın."
        />
      ) : (
        <DataTable
          data={departments}
          columns={columns}
          searchPlaceholder="Departman ara..."
        />
      )}
    </div>
  );
}

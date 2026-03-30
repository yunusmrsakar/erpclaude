"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { formatTarih } from "@/lib/format";
import { DURUM_ETIKETLERI } from "@/lib/constants";

interface Leave {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  notes: string | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeNo: string;
  };
}

export default function IzinlerPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchLeaves = () => {
    fetch("/api/ik/izinler")
      .then((r) => r.json())
      .then(setLeaves)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (id: string, status: "ONAYLANDI" | "REDDEDILDI") => {
    setUpdating(id);
    try {
      const res = await fetch("/api/ik/izinler", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (res.ok) {
        fetchLeaves();
      }
    } finally {
      setUpdating(null);
    }
  };

  const columns: ColumnDef<Leave, unknown>[] = [
    {
      id: "employee",
      header: "Çalışan",
      accessorFn: (row) => `${row.employee.firstName} ${row.employee.lastName}`,
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-shell">
            {row.original.employee.firstName} {row.original.employee.lastName}
          </p>
          <p className="text-xs text-fiori-neutral">{row.original.employee.employeeNo}</p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "İzin Türü",
      cell: ({ getValue }) => (
        <span className="text-sm">
          {DURUM_ETIKETLERI[getValue() as string] || (getValue() as string)}
        </span>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Başlangıç",
      cell: ({ getValue }) => formatTarih(getValue() as string),
    },
    {
      accessorKey: "endDate",
      header: "Bitiş",
      cell: ({ getValue }) => formatTarih(getValue() as string),
    },
    {
      accessorKey: "notes",
      header: "Notlar",
      cell: ({ getValue }) => (
        <span className="text-sm text-fiori-neutral">
          {(getValue() as string) || "-"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Durum",
      cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
    },
    {
      id: "actions",
      header: "İşlem",
      cell: ({ row }) => {
        if (row.original.status !== "BEKLEMEDE") return null;
        const isUpdating = updating === row.original.id;

        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleStatusUpdate(row.original.id, "ONAYLANDI")}
              disabled={isUpdating}
              className="p-1.5 rounded text-green-600 hover:bg-green-50 disabled:opacity-50"
              title="Onayla"
            >
              <Check size={16} />
            </button>
            <button
              onClick={() => handleStatusUpdate(row.original.id, "REDDEDILDI")}
              disabled={isUpdating}
              className="p-1.5 rounded text-red-600 hover:bg-red-50 disabled:opacity-50"
              title="Reddet"
            >
              <X size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="İzin Yönetimi" description="İzin talepleri ve onay süreçleri" />
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
        title="İzin Yönetimi"
        description="İzin talepleri ve onay süreçleri"
      />

      {leaves.length === 0 ? (
        <EmptyState
          title="Henüz izin talebi yok"
          description="Henüz bir izin talebi oluşturulmamış."
        />
      ) : (
        <DataTable
          data={leaves}
          columns={columns}
          searchPlaceholder="İzin talebi ara..."
        />
      )}
    </div>
  );
}

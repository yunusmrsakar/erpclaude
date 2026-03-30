"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { formatPara } from "@/lib/format";

interface Employee {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  position: string;
  salary: number;
  status: string;
  department: { id: string; name: string } | null;
}

const columns: ColumnDef<Employee, unknown>[] = [
  {
    accessorKey: "employeeNo",
    header: "Sicil No",
  },
  {
    id: "fullName",
    header: "Ad Soyad",
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
  },
  {
    id: "department",
    header: "Departman",
    accessorFn: (row) => row.department?.name || "-",
  },
  {
    accessorKey: "position",
    header: "Pozisyon",
  },
  {
    accessorKey: "salary",
    header: "Maaş",
    cell: ({ getValue }) => formatPara(getValue() as number),
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export default function CalisanlarPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ik/calisanlar")
      .then((r) => r.json())
      .then(setEmployees)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Çalışanlar" description="Çalışan listesi ve yönetimi" />
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
        title="Çalışanlar"
        description="Çalışan listesi ve yönetimi"
        createHref="/ik/calisanlar/yeni"
        createLabel="Yeni Çalışan"
      />

      {employees.length === 0 ? (
        <EmptyState
          title="Henüz çalışan yok"
          description="İlk çalışanı ekleyerek başlayın."
          createHref="/ik/calisanlar/yeni"
          createLabel="Yeni Çalışan"
        />
      ) : (
        <DataTable
          data={employees}
          columns={columns}
          searchPlaceholder="Çalışan ara..."
        />
      )}
    </div>
  );
}

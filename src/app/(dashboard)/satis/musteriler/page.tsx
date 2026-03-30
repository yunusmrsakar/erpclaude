"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";

interface Customer {
  id: string;
  code: string;
  name: string;
  city: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
}

const columns: ColumnDef<Customer, unknown>[] = [
  {
    accessorKey: "code",
    header: "Müşteri Kodu",
  },
  {
    accessorKey: "name",
    header: "Müşteri Adı",
  },
  {
    accessorKey: "city",
    header: "Şehir",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "phone",
    header: "Telefon",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "email",
    header: "E-posta",
    cell: ({ getValue }) => getValue() || "-",
  },
  {
    accessorKey: "isActive",
    header: "Durum",
    cell: ({ getValue }) => (
      <StatusBadge status={getValue() ? "AKTIF" : "PASIF"} />
    ),
  },
];

export default function MusterilerPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/satis/musteriler")
      .then((r) => r.json())
      .then(setCustomers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Müşteriler" description="Müşteri listesi ve yönetimi" />
        <div className="card p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-full mb-4" />
          <div className="h-8 bg-gray-200 rounded w-full mb-4" />
          <div className="h-8 bg-gray-200 rounded w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Müşteriler"
        description="Müşteri listesi ve yönetimi"
        createHref="/satis/musteriler/yeni"
        createLabel="Yeni Müşteri"
      />

      {customers.length === 0 ? (
        <EmptyState
          title="Henüz müşteri yok"
          description="İlk müşterinizi ekleyerek başlayın"
          createHref="/satis/musteriler/yeni"
          createLabel="Yeni Müşteri"
        />
      ) : (
        <DataTable
          data={customers}
          columns={columns}
          searchPlaceholder="Müşteri ara..."
        />
      )}
    </div>
  );
}

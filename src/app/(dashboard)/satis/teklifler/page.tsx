"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { formatPara, formatTarih } from "@/lib/format";

interface Quotation {
  id: string;
  quotationNo: string;
  customer: { name: string };
  date: string;
  validUntil: string | null;
  total: number;
  status: string;
}

const columns: ColumnDef<Quotation, unknown>[] = [
  {
    accessorKey: "quotationNo",
    header: "Teklif No",
  },
  {
    accessorKey: "customer.name",
    header: "Müşteri",
  },
  {
    accessorKey: "date",
    header: "Tarih",
    cell: ({ getValue }) => formatTarih(getValue() as string),
  },
  {
    accessorKey: "validUntil",
    header: "Geçerlilik Tarihi",
    cell: ({ getValue }) => {
      const val = getValue() as string | null;
      return val ? formatTarih(val) : "-";
    },
  },
  {
    accessorKey: "total",
    header: "Toplam",
    cell: ({ getValue }) => formatPara(getValue() as number),
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export default function TekliflerPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/satis/teklifler")
      .then((r) => r.json())
      .then(setQuotations)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Teklifler" description="Satış teklifleri listesi" />
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
        title="Teklifler"
        description="Satış teklifleri listesi ve yönetimi"
      />

      {quotations.length === 0 ? (
        <EmptyState
          title="Henüz teklif yok"
          description="Teklifler burada listelenecektir"
        />
      ) : (
        <DataTable
          data={quotations}
          columns={columns}
          searchPlaceholder="Teklif ara..."
        />
      )}
    </div>
  );
}

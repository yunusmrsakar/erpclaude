"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPara, formatTarih } from "@/lib/format";
import { DURUM_ETIKETLERI } from "@/lib/constants";

interface Invoice {
  id: string;
  invoiceNo: string;
  type: string;
  date: string;
  dueDate: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  status: string;
  customer?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
}

const columns: ColumnDef<Invoice, unknown>[] = [
  {
    accessorKey: "invoiceNo",
    header: "Fatura No",
    cell: ({ getValue }) => (
      <span className="font-medium text-shell">{getValue() as string}</span>
    ),
  },
  {
    accessorKey: "type",
    header: "Tur",
    cell: ({ getValue }) => {
      const type = getValue() as string;
      return (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            type === "SATIS"
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
          }`}
        >
          {DURUM_ETIKETLERI[type] || type}
        </span>
      );
    },
  },
  {
    id: "party",
    header: "Musteri / Tedarikci",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.customer?.name ||
          row.original.supplier?.name ||
          "-"}
      </span>
    ),
  },
  {
    accessorKey: "date",
    header: "Tarih",
    cell: ({ getValue }) => formatTarih(getValue() as string),
  },
  {
    accessorKey: "dueDate",
    header: "Vade Tarihi",
    cell: ({ getValue }) => formatTarih(getValue() as string),
  },
  {
    accessorKey: "total",
    header: "Toplam",
    cell: ({ getValue }) => (
      <span className="font-semibold">
        {formatPara(getValue() as number)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export default function FaturalarPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finans/faturalar")
      .then((r) => r.json())
      .then(setInvoices)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Faturalar"
          description="Satis ve alis faturalari"
          createHref="/finans/faturalar/yeni"
          createLabel="Yeni Fatura"
        />
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="animate-spin text-fiori-blue" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faturalar"
        description="Satis ve alis faturalari"
        createHref="/finans/faturalar/yeni"
        createLabel="Yeni Fatura"
      />
      <DataTable
        data={invoices}
        columns={columns}
        searchPlaceholder="Fatura no veya musteri ara..."
      />
    </div>
  );
}

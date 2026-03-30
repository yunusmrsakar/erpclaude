"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPara, formatTarih } from "@/lib/format";

interface PurchaseOrder {
  id: string;
  orderNo: string;
  date: string;
  status: string;
  total: number;
  supplier: { name: string };
}

const columns: ColumnDef<PurchaseOrder, unknown>[] = [
  {
    accessorKey: "orderNo",
    header: "Sipariş No",
    cell: ({ row }) => (
      <span className="font-medium text-fiori-blue">{row.original.orderNo}</span>
    ),
  },
  { accessorKey: "supplier.name", header: "Tedarikçi", cell: ({ row }) => row.original.supplier.name },
  { accessorKey: "date", header: "Tarih", cell: ({ row }) => formatTarih(row.original.date) },
  { accessorKey: "total", header: "Toplam", cell: ({ row }) => formatPara(row.original.total) },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function SatinAlmaSiparisPage() {
  const [data, setData] = useState<PurchaseOrder[]>([]);

  useEffect(() => {
    fetch("/api/satin-alma/siparisler").then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Satın Alma Siparişleri"
        description="Tedarikçi sipariş yönetimi"
        createHref="/satin-alma/siparisler/yeni"
        createLabel="Yeni Sipariş"
      />
      <DataTable data={data} columns={columns} searchPlaceholder="Sipariş ara..." />
    </div>
  );
}

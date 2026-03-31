"use client";
import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatTarih } from "@/lib/format";

interface ProductionOrder {
  id: string;
  orderNo: string;
  quantity: number;
  plannedStart: string;
  plannedEnd: string;
  status: string;
  priority: string;
  bom: { product: { name: string } };
}

const columns: ColumnDef<ProductionOrder, unknown>[] = [
  { accessorKey: "orderNo", header: "Emir No", cell: ({ row }) => <span className="font-medium text-fiori-blue">{row.original.orderNo}</span> },
  { id: "product", header: "Ürün", cell: ({ row }) => row.original.bom.product.name },
  { accessorKey: "quantity", header: "Miktar" },
  { accessorKey: "plannedStart", header: "Planlanan Başlangıç", cell: ({ row }) => formatTarih(row.original.plannedStart) },
  { accessorKey: "plannedEnd", header: "Planlanan Bitiş", cell: ({ row }) => formatTarih(row.original.plannedEnd) },
  { accessorKey: "priority", header: "Öncelik", cell: ({ row }) => <StatusBadge status={row.original.priority} /> },
  { accessorKey: "status", header: "Durum", cell: ({ row }) => <StatusBadge status={row.original.status} /> },
];

export default function UretimEmirleriPage() {
  const [data, setData] = useState<ProductionOrder[]>([]);
  useEffect(() => { fetch("/api/uretim/emirler").then(r => r.json()).then(setData); }, []);
  return (
    <div className="space-y-6">
      <PageHeader title="Üretim Emirleri" description="Üretim planlama ve takip" createHref="/uretim/emirler/yeni" createLabel="Yeni Üretim Emri" />
      <DataTable data={data} columns={columns} searchPlaceholder="Üretim emri ara..." />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPara, formatTarih } from "@/lib/format";

interface MaintenanceOrder {
  id: string;
  orderNo: string;
  type: string;
  priority: string;
  description: string;
  plannedDate: string;
  cost: number;
  status: string;
  equipment: { name: string };
}

const columns: ColumnDef<MaintenanceOrder, unknown>[] = [
  {
    accessorKey: "orderNo",
    header: "Emir No",
    cell: ({ row }) => (
      <span className="font-medium text-fiori-blue">{row.original.orderNo}</span>
    ),
  },
  {
    accessorKey: "equipment.name",
    header: "Ekipman",
    cell: ({ row }) => row.original.equipment?.name,
  },
  {
    accessorKey: "type",
    header: "Tür",
    cell: ({ row }) => <StatusBadge status={row.original.type} />,
  },
  {
    accessorKey: "priority",
    header: "Öncelik",
    cell: ({ row }) => <StatusBadge status={row.original.priority} />,
  },
  {
    accessorKey: "description",
    header: "Açıklama",
    cell: ({ row }) => (
      <span className="truncate max-w-[200px] block">{row.original.description}</span>
    ),
  },
  {
    accessorKey: "plannedDate",
    header: "Planlanan Tarih",
    cell: ({ row }) => formatTarih(row.original.plannedDate),
  },
  {
    accessorKey: "cost",
    header: "Maliyet",
    cell: ({ row }) => formatPara(row.original.cost),
  },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function BakimEmirleriPage() {
  const [data, setData] = useState<MaintenanceOrder[]>([]);

  useEffect(() => {
    fetch("/api/bakim/emirler").then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bakım Emirleri"
        description="Bakım ve onarım iş emirleri"
        createHref="/bakim/emirler/yeni"
        createLabel="Yeni Bakım Emri"
      />
      <DataTable data={data} columns={columns} searchPlaceholder="Bakım emri ara..." />
    </div>
  );
}

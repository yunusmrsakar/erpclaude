"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";

interface Equipment {
  id: string;
  equipmentNo: string;
  name: string;
  location: string;
  manufacturer: string;
  serialNo: string;
  status: string;
}

const columns: ColumnDef<Equipment, unknown>[] = [
  {
    accessorKey: "equipmentNo",
    header: "Ekipman No",
    cell: ({ row }) => (
      <span className="font-medium text-fiori-blue">{row.original.equipmentNo}</span>
    ),
  },
  { accessorKey: "name", header: "Ekipman Adı" },
  { accessorKey: "location", header: "Konum" },
  { accessorKey: "manufacturer", header: "Üretici" },
  { accessorKey: "serialNo", header: "Seri No" },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function EkipmanlarPage() {
  const [data, setData] = useState<Equipment[]>([]);

  useEffect(() => {
    fetch("/api/bakim/ekipmanlar").then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ekipmanlar"
        description="Ekipman ve makine envanter yönetimi"
        createHref="/bakim/ekipmanlar/yeni"
        createLabel="Yeni Ekipman"
      />
      <DataTable data={data} columns={columns} searchPlaceholder="Ekipman ara..." />
    </div>
  );
}

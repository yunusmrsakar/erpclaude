"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";

interface BOM {
  id: string;
  bomNo: string;
  version: string;
  status: string;
  product: { name: string };
  items: any[];
}

const columns: ColumnDef<BOM, unknown>[] = [
  {
    accessorKey: "bomNo",
    header: "Reçete No",
    cell: ({ row }) => (
      <span className="font-medium text-fiori-blue">{row.original.bomNo}</span>
    ),
  },
  { accessorKey: "product.name", header: "Ürün", cell: ({ row }) => row.original.product.name },
  { accessorKey: "version", header: "Versiyon" },
  { id: "itemCount", header: "Malzeme Sayısı", cell: ({ row }) => row.original.items.length },
  {
    accessorKey: "status",
    header: "Durum",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];

export default function RecetelerPage() {
  const [data, setData] = useState<BOM[]>([]);

  useEffect(() => {
    fetch("/api/uretim/receteler").then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ürün Reçeteleri (BOM)"
        description="Ürün ağacı ve malzeme listesi yönetimi"
        createHref="/uretim/receteler/yeni"
        createLabel="Yeni Reçete"
      />
      <DataTable data={data} columns={columns} searchPlaceholder="Reçete ara..." />
    </div>
  );
}

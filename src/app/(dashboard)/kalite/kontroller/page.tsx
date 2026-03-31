"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import PageHeader from "@/components/shared/PageHeader";
import DataTable from "@/components/shared/DataTable";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatTarih } from "@/lib/format";

interface QualityInspection {
  id: string;
  inspectionNo: string;
  inspectorName: string;
  date: string;
  result: string;
  sampleSize: number;
  product: { name: string };
}

const columns: ColumnDef<QualityInspection, unknown>[] = [
  {
    accessorKey: "inspectionNo",
    header: "Kontrol No",
    cell: ({ row }) => (
      <span className="font-medium text-fiori-blue">
        {row.original.inspectionNo}
      </span>
    ),
  },
  {
    accessorKey: "product.name",
    header: "Ürün",
    cell: ({ row }) => row.original.product.name,
  },
  { accessorKey: "inspectorName", header: "Kontrol Eden" },
  {
    accessorKey: "date",
    header: "Tarih",
    cell: ({ row }) => formatTarih(row.original.date),
  },
  { accessorKey: "sampleSize", header: "Numune" },
  {
    accessorKey: "result",
    header: "Sonuç",
    cell: ({ row }) => <StatusBadge status={row.original.result} />,
  },
];

export default function KaliteKontrolPage() {
  const [data, setData] = useState<QualityInspection[]>([]);

  useEffect(() => {
    fetch("/api/kalite/kontroller")
      .then((r) => r.json())
      .then(setData);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kalite Kontrolleri"
        description="Kalite denetim ve kontrol yönetimi"
        createHref="/kalite/kontroller/yeni"
        createLabel="Yeni Kontrol"
      />
      <DataTable
        data={data}
        columns={columns}
        searchPlaceholder="Kontrol ara..."
      />
    </div>
  );
}

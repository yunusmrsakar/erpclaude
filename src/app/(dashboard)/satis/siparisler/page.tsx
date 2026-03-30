"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import { formatPara, formatTarih } from "@/lib/format";

interface SalesOrder {
  id: string;
  orderNo: string;
  customer: { name: string };
  date: string;
  total: number;
  status: string;
}

const columns: ColumnDef<SalesOrder, unknown>[] = [
  {
    accessorKey: "orderNo",
    header: "Sipariş No",
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

export default function SiparislerPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/satis/siparisler")
      .then((r) => r.json())
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Satış Siparişleri" description="Satış siparişleri listesi" />
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
        title="Satış Siparişleri"
        description="Satış siparişleri listesi ve yönetimi"
        createHref="/satis/siparisler/yeni"
        createLabel="Yeni Sipariş"
      />

      {orders.length === 0 ? (
        <EmptyState
          title="Henüz sipariş yok"
          description="İlk satış siparişinizi oluşturun"
          createHref="/satis/siparisler/yeni"
          createLabel="Yeni Sipariş"
        />
      ) : (
        <DataTable
          data={orders}
          columns={columns}
          searchPlaceholder="Sipariş ara..."
        />
      )}
    </div>
  );
}

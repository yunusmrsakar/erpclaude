"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "@/components/shared/DataTable";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPara, formatSayi } from "@/lib/format";

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  taxRate: number;
  isActive: boolean;
  category: { id: string; name: string } | null;
  stockLevels: { quantity: number }[];
}

const BIRIM_ETIKETLERI: Record<string, string> = {
  ADET: "Adet",
  KG: "Kg",
  LT: "Lt",
  MT: "Mt",
};

const columns: ColumnDef<Product, unknown>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "name",
    header: "Ürün Adı",
  },
  {
    accessorFn: (row) => row.category?.name || "-",
    id: "category",
    header: "Kategori",
  },
  {
    accessorKey: "unit",
    header: "Birim",
    cell: ({ getValue }) => BIRIM_ETIKETLERI[getValue() as string] || getValue(),
  },
  {
    accessorKey: "purchasePrice",
    header: "Alış Fiyatı",
    cell: ({ getValue }) => formatPara(getValue() as number),
  },
  {
    accessorKey: "salePrice",
    header: "Satış Fiyatı",
    cell: ({ getValue }) => formatPara(getValue() as number),
  },
  {
    id: "totalStock",
    header: "Toplam Stok",
    accessorFn: (row) =>
      row.stockLevels.reduce((sum, sl) => sum + sl.quantity, 0),
    cell: ({ getValue }) => formatSayi(getValue() as number),
  },
  {
    id: "status",
    header: "Durum",
    accessorFn: (row) => (row.isActive ? "AKTIF" : "PASIF"),
    cell: ({ getValue }) => <StatusBadge status={getValue() as string} />,
  },
];

export default function UrunlerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stok/urunler")
      .then((r) => r.json())
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Ürünler" description="Ürün listesi ve stok bilgileri" />
        <div className="card p-8 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ürünler"
        description="Ürün listesi ve stok bilgileri"
        createHref="/stok/urunler/yeni"
        createLabel="Yeni Ürün"
      />

      {products.length === 0 ? (
        <EmptyState
          title="Henüz ürün eklenmemiş"
          description="Yeni bir ürün ekleyerek stok takibine başlayın."
          createHref="/stok/urunler/yeni"
          createLabel="Yeni Ürün"
        />
      ) : (
        <DataTable
          data={products}
          columns={columns}
          searchPlaceholder="Ürün ara..."
        />
      )}
    </div>
  );
}

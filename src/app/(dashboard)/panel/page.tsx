"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Package,
  FileText,
  ShoppingCart,
  Truck,
  TrendingUp,
  AlertTriangle,
  Clock,
} from "lucide-react";
import KPICard from "@/components/shared/KPICard";
import StatusBadge from "@/components/shared/StatusBadge";
import { formatPara, formatTarih } from "@/lib/format";

interface DashboardData {
  musteriSayisi: number;
  tedarikciSayisi: number;
  calisanSayisi: number;
  urunSayisi: number;
  toplamFatura: number;
  faturaSayisi: number;
  toplamSiparis: number;
  siparisSayisi: number;
  sonFaturalar: Array<{
    id: string;
    invoiceNo: string;
    type: string;
    total: number;
    status: string;
    date: string;
    customer?: { name: string } | null;
    supplier?: { name: string } | null;
  }>;
  dusukStok: Array<{
    product: { name: string; sku: string };
    warehouse: { name: string };
    quantity: number;
  }>;
  bekleyenIzin: number;
}

export default function PanelPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-shell">Panel</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-shell">Panel</h1>
        <p className="text-sm text-fiori-neutral mt-1">Genel bakış ve özet bilgiler</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Toplam Satış"
          value={formatPara(data.toplamSiparis)}
          icon={TrendingUp}
          color="green"
        />
        <KPICard
          title="Fatura Tutarı"
          value={formatPara(data.toplamFatura)}
          icon={FileText}
          color="blue"
        />
        <KPICard
          title="Aktif Müşteri"
          value={String(data.musteriSayisi)}
          icon={ShoppingCart}
          color="orange"
        />
        <KPICard
          title="Aktif Çalışan"
          value={String(data.calisanSayisi)}
          icon={Users}
          color="neutral"
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Ürün Sayısı" value={String(data.urunSayisi)} icon={Package} color="blue" />
        <KPICard title="Tedarikçi" value={String(data.tedarikciSayisi)} icon={Truck} color="green" />
        <KPICard title="Fatura Sayısı" value={String(data.faturaSayisi)} icon={FileText} color="orange" />
        <KPICard
          title="Bekleyen İzin"
          value={String(data.bekleyenIzin)}
          icon={Clock}
          color={data.bekleyenIzin > 0 ? "red" : "neutral"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son Faturalar */}
        <div className="card">
          <div className="px-5 py-4 border-b border-fiori-border">
            <h2 className="font-semibold text-shell">Son Faturalar</h2>
          </div>
          <div className="divide-y divide-fiori-border">
            {data.sonFaturalar.length === 0 ? (
              <p className="p-5 text-sm text-fiori-neutral text-center">Henüz fatura yok</p>
            ) : (
              data.sonFaturalar.map((f) => (
                <div key={f.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-shell">{f.invoiceNo}</p>
                    <p className="text-xs text-fiori-neutral">
                      {f.customer?.name || f.supplier?.name || "-"} — {formatTarih(f.date)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPara(f.total)}</p>
                    <StatusBadge status={f.status} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Düşük Stok Uyarısı */}
        <div className="card">
          <div className="px-5 py-4 border-b border-fiori-border flex items-center gap-2">
            <AlertTriangle size={18} className="text-fiori-orange" />
            <h2 className="font-semibold text-shell">Düşük Stok Uyarısı</h2>
          </div>
          <div className="divide-y divide-fiori-border">
            {data.dusukStok.length === 0 ? (
              <p className="p-5 text-sm text-fiori-neutral text-center">Stok seviyeleri normal</p>
            ) : (
              data.dusukStok.map((s, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-shell">{s.product.name}</p>
                    <p className="text-xs text-fiori-neutral">
                      {s.product.sku} — {s.warehouse.name}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-fiori-red">{s.quantity} adet</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

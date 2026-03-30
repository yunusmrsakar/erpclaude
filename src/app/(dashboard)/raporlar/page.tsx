"use client";

import { useEffect, useState } from "react";
import { Wallet, Package, ShoppingCart, TrendingUp, FileText, Users } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import KPICard from "@/components/shared/KPICard";
import { formatPara, formatSayi } from "@/lib/format";

interface ReportData {
  finansal?: {
    toplamGelir: number;
    toplamGider: number;
    faturaSayisi: number;
    odenmisFatura: number;
    bekleyenFatura: number;
  };
  stok?: {
    toplamUrun: number;
    dusukStok: number;
    toplamStokDegeri: number;
    girisSayisi: number;
    cikisSayisi: number;
  };
  satis?: {
    toplamSatis: number;
    siparisSayisi: number;
    bekleyenSiparis: number;
    tamamlananSiparis: number;
    musteriSayisi: number;
  };
}

export default function RaporlarPage() {
  const [activeTab, setActiveTab] = useState<"finansal" | "stok" | "satis">("finansal");
  const [data, setData] = useState<ReportData>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/raporlar?type=${activeTab}`)
      .then((r) => r.json())
      .then((d) => setData((prev) => ({ ...prev, [activeTab]: d })))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const tabs = [
    { key: "finansal" as const, label: "Finansal Rapor", icon: Wallet },
    { key: "stok" as const, label: "Stok Raporu", icon: Package },
    { key: "satis" as const, label: "Satış Analizi", icon: ShoppingCart },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Raporlar" description="Detaylı analiz ve raporlama merkezi" />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-fiori-border pb-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-fiori-blue text-fiori-blue"
                  : "border-transparent text-fiori-neutral hover:text-shell"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Finansal */}
          {activeTab === "finansal" && data.finansal && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard title="Toplam Gelir" value={formatPara(data.finansal.toplamGelir)} icon={TrendingUp} color="green" />
                <KPICard title="Toplam Gider" value={formatPara(data.finansal.toplamGider)} icon={Wallet} color="red" />
                <KPICard
                  title="Net Kar/Zarar"
                  value={formatPara(data.finansal.toplamGelir - data.finansal.toplamGider)}
                  icon={TrendingUp}
                  color={data.finansal.toplamGelir - data.finansal.toplamGider >= 0 ? "green" : "red"}
                />
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-shell mb-4">Fatura Durumu</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-shell">{data.finansal.faturaSayisi}</p>
                    <p className="text-sm text-fiori-neutral">Toplam Fatura</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-fiori-green">{data.finansal.odenmisFatura}</p>
                    <p className="text-sm text-fiori-neutral">Ödenen</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-fiori-orange">{data.finansal.bekleyenFatura}</p>
                    <p className="text-sm text-fiori-neutral">Bekleyen</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stok */}
          {activeTab === "stok" && data.stok && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard title="Toplam Ürün" value={formatSayi(data.stok.toplamUrun)} icon={Package} color="blue" />
                <KPICard title="Düşük Stok" value={formatSayi(data.stok.dusukStok)} icon={Package} color="red" />
                <KPICard title="Stok Değeri" value={formatPara(data.stok.toplamStokDegeri)} icon={TrendingUp} color="green" />
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-shell mb-4">Stok Hareketleri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-fiori-green">{data.stok.girisSayisi}</p>
                    <p className="text-sm text-fiori-neutral">Giriş Hareketi</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-fiori-red">{data.stok.cikisSayisi}</p>
                    <p className="text-sm text-fiori-neutral">Çıkış Hareketi</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Satış */}
          {activeTab === "satis" && data.satis && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KPICard title="Toplam Satış" value={formatPara(data.satis.toplamSatis)} icon={ShoppingCart} color="green" />
                <KPICard title="Sipariş Sayısı" value={formatSayi(data.satis.siparisSayisi)} icon={FileText} color="blue" />
                <KPICard title="Aktif Müşteri" value={formatSayi(data.satis.musteriSayisi)} icon={Users} color="orange" />
              </div>
              <div className="card p-6">
                <h3 className="font-semibold text-shell mb-4">Sipariş Durumu</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-fiori-orange">{data.satis.bekleyenSiparis}</p>
                    <p className="text-sm text-fiori-neutral">Bekleyen Sipariş</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-fiori-green">{data.satis.tamamlananSiparis}</p>
                    <p className="text-sm text-fiori-neutral">Tamamlanan Sipariş</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

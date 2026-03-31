"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, User } from "lucide-react";

const BREADCRUMB_MAP: Record<string, string> = {
  panel: "Panel",
  finans: "Finans",
  "hesap-plani": "Hesap Planı",
  yevmiye: "Yevmiye Kayıtları",
  faturalar: "Faturalar",
  ik: "İnsan Kaynakları",
  calisanlar: "Çalışanlar",
  departmanlar: "Departmanlar",
  izinler: "İzin Yönetimi",
  bordro: "Bordro",
  stok: "Stok Yönetimi",
  urunler: "Ürünler",
  depolar: "Depolar",
  hareketler: "Stok Hareketleri",
  satis: "Satış",
  musteriler: "Müşteriler",
  siparisler: "Siparişler",
  teklifler: "Teklifler",
  "satin-alma": "Satın Alma",
  tedarikciler: "Tedarikçiler",
  crm: "CRM",
  kisiler: "Kişiler",
  firsatlar: "Fırsatlar",
  aktiviteler: "Aktiviteler",
  raporlar: "Raporlar",
  uretim: "Üretim",
  receteler: "Ürün Reçeteleri",
  emirler: "Emirler",
  kalite: "Kalite Yönetimi",
  kontroller: "Kalite Kontrolleri",
  bakim: "Bakım & Onarım",
  ekipmanlar: "Ekipmanlar",
  ayarlar: "Ayarlar",
  yeni: "Yeni",
};

export default function Topbar() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="h-14 bg-white border-b border-fiori-border flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm">
        {segments.map((segment, i) => (
          <span key={segment} className="flex items-center gap-2">
            {i > 0 && <span className="text-gray-300">/</span>}
            <span
              className={
                i === segments.length - 1
                  ? "text-shell font-medium"
                  : "text-fiori-neutral"
              }
            >
              {BREADCRUMB_MAP[segment] || segment}
            </span>
          </span>
        ))}
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}>
          <Search size={18} className="text-fiori-neutral" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell size={18} className="text-fiori-neutral" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-fiori-red rounded-full" />
        </button>
        <div className="w-8 h-8 bg-fiori-blue rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
      </div>
    </header>
  );
}

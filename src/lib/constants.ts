import {
  LayoutDashboard,
  Wallet,
  Users,
  Package,
  ShoppingCart,
  Truck,
  Handshake,
  BarChart3,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    title: "Panel",
    href: "/panel",
    icon: LayoutDashboard,
  },
  {
    title: "Finans",
    href: "/finans",
    icon: Wallet,
    children: [
      { title: "Hesap Planı", href: "/finans/hesap-plani" },
      { title: "Yevmiye Kayıtları", href: "/finans/yevmiye" },
      { title: "Faturalar", href: "/finans/faturalar" },
    ],
  },
  {
    title: "İnsan Kaynakları",
    href: "/ik",
    icon: Users,
    children: [
      { title: "Çalışanlar", href: "/ik/calisanlar" },
      { title: "Departmanlar", href: "/ik/departmanlar" },
      { title: "İzin Yönetimi", href: "/ik/izinler" },
      { title: "Bordro", href: "/ik/bordro" },
    ],
  },
  {
    title: "Stok Yönetimi",
    href: "/stok",
    icon: Package,
    children: [
      { title: "Ürünler", href: "/stok/urunler" },
      { title: "Depolar", href: "/stok/depolar" },
      { title: "Stok Hareketleri", href: "/stok/hareketler" },
    ],
  },
  {
    title: "Satış",
    href: "/satis",
    icon: ShoppingCart,
    children: [
      { title: "Müşteriler", href: "/satis/musteriler" },
      { title: "Satış Siparişleri", href: "/satis/siparisler" },
      { title: "Teklifler", href: "/satis/teklifler" },
    ],
  },
  {
    title: "Satın Alma",
    href: "/satin-alma",
    icon: Truck,
    children: [
      { title: "Tedarikçiler", href: "/satin-alma/tedarikciler" },
      { title: "Satın Alma Siparişleri", href: "/satin-alma/siparisler" },
    ],
  },
  {
    title: "CRM",
    href: "/crm",
    icon: Handshake,
    children: [
      { title: "Kişiler", href: "/crm/kisiler" },
      { title: "Fırsatlar", href: "/crm/firsatlar" },
      { title: "Aktiviteler", href: "/crm/aktiviteler" },
    ],
  },
  {
    title: "Raporlar",
    href: "/raporlar",
    icon: BarChart3,
  },
];

export const DURUM_RENKLERI: Record<string, string> = {
  TASLAK: "bg-gray-100 text-gray-800",
  BEKLEMEDE: "bg-yellow-100 text-yellow-800",
  ONAYLANDI: "bg-blue-100 text-blue-800",
  GONDERILDI: "bg-indigo-100 text-indigo-800",
  ODENDI: "bg-green-100 text-green-800",
  IPTAL: "bg-red-100 text-red-800",
  AKTIF: "bg-green-100 text-green-800",
  PASIF: "bg-gray-100 text-gray-800",
  IZINLI: "bg-orange-100 text-orange-800",
  REDDEDILDI: "bg-red-100 text-red-800",
  SEVKEDILDI: "bg-purple-100 text-purple-800",
  TAMAMLANDI: "bg-green-100 text-green-800",
  HAZIRLANIYOR: "bg-yellow-100 text-yellow-800",
  TESLIM_ALINDI: "bg-blue-100 text-blue-800",
  TESLIM_EDILDI: "bg-green-100 text-green-800",
  KABUL: "bg-green-100 text-green-800",
  RED: "bg-red-100 text-red-800",
  ADAY: "bg-gray-100 text-gray-800",
  NITELENDIRME: "bg-blue-100 text-blue-800",
  TEKLIF: "bg-indigo-100 text-indigo-800",
  MUZAKERE: "bg-yellow-100 text-yellow-800",
  KAZANILDI: "bg-green-100 text-green-800",
  KAYBEDILDI: "bg-red-100 text-red-800",
};

export const DURUM_ETIKETLERI: Record<string, string> = {
  TASLAK: "Taslak",
  BEKLEMEDE: "Beklemede",
  ONAYLANDI: "Onaylandı",
  GONDERILDI: "Gönderildi",
  ODENDI: "Ödendi",
  IPTAL: "İptal",
  AKTIF: "Aktif",
  PASIF: "Pasif",
  IZINLI: "İzinli",
  REDDEDILDI: "Reddedildi",
  SEVKEDILDI: "Sevk Edildi",
  TAMAMLANDI: "Tamamlandı",
  HAZIRLANIYOR: "Hazırlanıyor",
  TESLIM_ALINDI: "Teslim Alındı",
  TESLIM_EDILDI: "Teslim Edildi",
  KABUL: "Kabul Edildi",
  RED: "Reddedildi",
  ADAY: "Aday",
  NITELENDIRME: "Nitelendirme",
  TEKLIF: "Teklif",
  MUZAKERE: "Müzakere",
  KAZANILDI: "Kazanıldı",
  KAYBEDILDI: "Kaybedildi",
  YILLIK: "Yıllık İzin",
  HASTALIK: "Hastalık İzni",
  MAZERET: "Mazeret İzni",
  DOGUM: "Doğum İzni",
  SATIS: "Satış",
  ALIS: "Alış",
  GIRIS: "Giriş",
  CIKIS: "Çıkış",
  TRANSFER: "Transfer",
  ARAMA: "Arama",
  TOPLANTI: "Toplantı",
  EMAIL: "E-posta",
  NOT: "Not",
};

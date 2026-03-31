import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg(process.env.DATABASE_URL);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seed verileri oluşturuluyor...");

  // Hesap Planı
  const hesaplar = [
    { code: "100", name: "Kasa", type: "VARLIK" },
    { code: "101", name: "Alınan Çekler", type: "VARLIK" },
    { code: "102", name: "Bankalar", type: "VARLIK" },
    { code: "120", name: "Alıcılar", type: "VARLIK" },
    { code: "150", name: "İlk Madde ve Malzeme", type: "VARLIK" },
    { code: "152", name: "Mamuller", type: "VARLIK" },
    { code: "153", name: "Ticari Mallar", type: "VARLIK" },
    { code: "255", name: "Demirbaşlar", type: "VARLIK" },
    { code: "300", name: "Banka Kredileri", type: "KAYNAK" },
    { code: "320", name: "Satıcılar", type: "KAYNAK" },
    { code: "335", name: "Personele Borçlar", type: "KAYNAK" },
    { code: "360", name: "Ödenecek Vergi ve Fonlar", type: "KAYNAK" },
    { code: "361", name: "Ödenecek SGK Primleri", type: "KAYNAK" },
    { code: "500", name: "Sermaye", type: "OZKAYNAK" },
    { code: "570", name: "Geçmiş Yıllar Karları", type: "OZKAYNAK" },
    { code: "600", name: "Yurtiçi Satışlar", type: "GELIR" },
    { code: "601", name: "Yurtdışı Satışlar", type: "GELIR" },
    { code: "602", name: "Diğer Gelirler", type: "GELIR" },
    { code: "620", name: "Satılan Mamuller Maliyeti", type: "GIDER" },
    { code: "621", name: "Satılan Ticari Mallar Maliyeti", type: "GIDER" },
    { code: "630", name: "Araştırma ve Geliştirme Giderleri", type: "GIDER" },
    { code: "631", name: "Pazarlama Satış Dağıtım Giderleri", type: "GIDER" },
    { code: "632", name: "Genel Yönetim Giderleri", type: "GIDER" },
  ];

  for (const h of hesaplar) {
    await prisma.account.upsert({ where: { code: h.code }, update: {}, create: h });
  }
  console.log("✓ Hesap planı oluşturuldu");

  // Departmanlar
  const deptler = ["Yönetim", "Finans", "İnsan Kaynakları", "Bilgi Teknolojileri", "Satış", "Üretim", "Lojistik"];
  const departments = {};
  for (const name of deptler) {
    const d = await prisma.department.create({ data: { name } });
    departments[name] = d.id;
  }
  console.log("✓ Departmanlar oluşturuldu");

  // Çalışanlar
  const calisanlar = [
    { employeeNo: "EMP001", firstName: "Ahmet", lastName: "Yılmaz", email: "ahmet@erp.com", phone: "532 111 2233", position: "Genel Müdür", salary: 85000, department: "Yönetim" },
    { employeeNo: "EMP002", firstName: "Fatma", lastName: "Demir", email: "fatma@erp.com", phone: "533 222 3344", position: "Finans Müdürü", salary: 55000, department: "Finans" },
    { employeeNo: "EMP003", firstName: "Mehmet", lastName: "Kaya", email: "mehmet@erp.com", phone: "534 333 4455", position: "Yazılım Geliştirici", salary: 45000, department: "Bilgi Teknolojileri" },
    { employeeNo: "EMP004", firstName: "Ayşe", lastName: "Çelik", email: "ayse@erp.com", phone: "535 444 5566", position: "İK Uzmanı", salary: 35000, department: "İnsan Kaynakları" },
    { employeeNo: "EMP005", firstName: "Ali", lastName: "Öztürk", email: "ali@erp.com", phone: "536 555 6677", position: "Satış Temsilcisi", salary: 32000, department: "Satış" },
    { employeeNo: "EMP006", firstName: "Zeynep", lastName: "Arslan", email: "zeynep@erp.com", phone: "537 666 7788", position: "Muhasebe Uzmanı", salary: 38000, department: "Finans" },
    { employeeNo: "EMP007", firstName: "Mustafa", lastName: "Şahin", email: "mustafa@erp.com", phone: "538 777 8899", position: "Üretim Şefi", salary: 40000, department: "Üretim" },
    { employeeNo: "EMP008", firstName: "Elif", lastName: "Aydın", email: "elif@erp.com", phone: "539 888 9900", position: "Lojistik Koordinatör", salary: 36000, department: "Lojistik" },
  ];

  for (const c of calisanlar) {
    await prisma.employee.create({
      data: {
        employeeNo: c.employeeNo, firstName: c.firstName, lastName: c.lastName,
        email: c.email, phone: c.phone, position: c.position, salary: c.salary,
        hireDate: new Date("2024-01-15"), departmentId: departments[c.department], status: "AKTIF",
      },
    });
  }
  console.log("✓ Çalışanlar oluşturuldu");

  // Depolar
  const depo1 = await prisma.warehouse.create({ data: { name: "Ana Depo", address: "İstanbul, Tuzla OSB" } });
  const depo2 = await prisma.warehouse.create({ data: { name: "Ankara Depo", address: "Ankara, OSTİM" } });
  console.log("✓ Depolar oluşturuldu");

  // Kategoriler
  const katElektronik = await prisma.category.create({ data: { name: "Elektronik" } });
  const katOfis = await prisma.category.create({ data: { name: "Ofis Malzemeleri" } });
  const katHammadde = await prisma.category.create({ data: { name: "Hammadde" } });

  // Ürünler
  const urunler = [
    { sku: "PRD001", name: "Laptop", categoryId: katElektronik.id, unit: "ADET", purchasePrice: 25000, salePrice: 32000, taxRate: 20 },
    { sku: "PRD002", name: 'Monitor 27"', categoryId: katElektronik.id, unit: "ADET", purchasePrice: 8000, salePrice: 11000, taxRate: 20 },
    { sku: "PRD003", name: "Klavye", categoryId: katElektronik.id, unit: "ADET", purchasePrice: 500, salePrice: 800, taxRate: 20 },
    { sku: "PRD004", name: "Mouse", categoryId: katElektronik.id, unit: "ADET", purchasePrice: 300, salePrice: 500, taxRate: 20 },
    { sku: "PRD005", name: "A4 Kağıt (500'lü)", categoryId: katOfis.id, unit: "ADET", purchasePrice: 80, salePrice: 120, taxRate: 10 },
    { sku: "PRD006", name: "Toner Kartuş", categoryId: katOfis.id, unit: "ADET", purchasePrice: 400, salePrice: 600, taxRate: 20 },
    { sku: "PRD007", name: "Çelik Levha (1m²)", categoryId: katHammadde.id, unit: "MT", purchasePrice: 1500, salePrice: 2000, taxRate: 20 },
    { sku: "PRD008", name: "Bakır Kablo (100m)", categoryId: katHammadde.id, unit: "MT", purchasePrice: 3000, salePrice: 4200, taxRate: 20 },
  ];

  const products = {};
  for (const u of urunler) {
    const p = await prisma.product.create({ data: u });
    products[u.sku] = p.id;
    await prisma.stockLevel.create({ data: { productId: p.id, warehouseId: depo1.id, quantity: Math.floor(Math.random() * 100) + 5 } });
    await prisma.stockLevel.create({ data: { productId: p.id, warehouseId: depo2.id, quantity: Math.floor(Math.random() * 50) + 2 } });
  }
  console.log("✓ Ürünler ve stok seviyeleri oluşturuldu");

  // Müşteriler
  const musteriler = [
    { code: "MUS001", name: "ABC Teknoloji A.Ş.", taxNumber: "1234567890", taxOffice: "Kadıköy", city: "İstanbul", phone: "212 111 2233", email: "info@abctech.com", contactPerson: "Kemal Bey" },
    { code: "MUS002", name: "XYZ Danışmanlık Ltd.", taxNumber: "9876543210", taxOffice: "Çankaya", city: "Ankara", phone: "312 222 3344", email: "info@xyz.com", contactPerson: "Selin Hanım" },
    { code: "MUS003", name: "Mega İnşaat A.Ş.", taxNumber: "5555555555", taxOffice: "Alsancak", city: "İzmir", phone: "232 333 4455", email: "satis@mega.com", contactPerson: "Murat Bey" },
    { code: "MUS004", name: "Star Lojistik Ltd.", taxNumber: "4444444444", taxOffice: "Mersin", city: "Mersin", phone: "324 444 5566", email: "info@starlojistik.com", contactPerson: "Deniz Hanım" },
  ];

  const customers = {};
  for (const m of musteriler) {
    const c = await prisma.customer.create({ data: m });
    customers[m.code] = c.id;
  }
  console.log("✓ Müşteriler oluşturuldu");

  // Tedarikçiler
  const tedarikciler = [
    { code: "TED001", name: "Global Elektronik A.Ş.", taxNumber: "1111111111", taxOffice: "Kadıköy", city: "İstanbul", phone: "212 999 8877", email: "satis@globalelektronik.com" },
    { code: "TED002", name: "Demir Çelik San. Ltd.", taxNumber: "2222222222", taxOffice: "Karabük", city: "Karabük", phone: "370 888 7766", email: "info@demircelik.com" },
    { code: "TED003", name: "Ofis Market A.Ş.", taxNumber: "3333333333", taxOffice: "Kızılay", city: "Ankara", phone: "312 777 6655", email: "siparis@ofismarket.com" },
  ];

  const suppliers = {};
  for (const t of tedarikciler) {
    const s = await prisma.supplier.create({ data: t });
    suppliers[t.code] = s.id;
  }
  console.log("✓ Tedarikçiler oluşturuldu");

  // Faturalar
  await prisma.invoice.create({
    data: {
      invoiceNo: "FTR-2024-001", type: "SATIS", customerId: customers["MUS001"],
      date: new Date("2024-11-15"), dueDate: new Date("2024-12-15"),
      subtotal: 43000, taxAmount: 8600, total: 51600, status: "ODENDI",
      lines: { create: [
        { description: "Laptop", quantity: 1, unitPrice: 32000, taxRate: 20, total: 38400 },
        { description: 'Monitor 27"', quantity: 1, unitPrice: 11000, taxRate: 20, total: 13200 },
      ]},
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNo: "FTR-2024-002", type: "SATIS", customerId: customers["MUS002"],
      date: new Date("2024-12-01"), dueDate: new Date("2025-01-01"),
      subtotal: 2400, taxAmount: 480, total: 2880, status: "GONDERILDI",
      lines: { create: [
        { description: "Klavye", quantity: 2, unitPrice: 800, taxRate: 20, total: 1920 },
        { description: "Mouse", quantity: 2, unitPrice: 500, taxRate: 20, total: 1200 },
      ]},
    },
  });

  await prisma.invoice.create({
    data: {
      invoiceNo: "FTR-2024-003", type: "ALIS", supplierId: suppliers["TED001"],
      date: new Date("2024-12-10"), dueDate: new Date("2025-01-10"),
      subtotal: 75000, taxAmount: 15000, total: 90000, status: "ODENDI",
      lines: { create: [
        { description: "Laptop (toptan)", quantity: 3, unitPrice: 25000, taxRate: 20, total: 90000 },
      ]},
    },
  });
  console.log("✓ Faturalar oluşturuldu");

  // Satış Siparişleri
  await prisma.salesOrder.create({
    data: {
      orderNo: "SIP-2024-001", customerId: customers["MUS003"],
      date: new Date("2024-12-20"), deliveryDate: new Date("2025-01-05"),
      status: "ONAYLANDI", subtotal: 64000, taxAmount: 12800, total: 76800,
      lines: { create: [
        { productId: products["PRD001"], quantity: 2, unitPrice: 32000, taxRate: 20, total: 76800 },
      ]},
    },
  });
  console.log("✓ Satış siparişleri oluşturuldu");

  // CRM
  await prisma.contact.create({
    data: { firstName: "Kemal", lastName: "Yıldız", company: "ABC Teknoloji A.Ş.", email: "kemal@abctech.com", phone: "532 999 1122", type: "MUSTERI", customerId: customers["MUS001"] },
  });
  await prisma.contact.create({
    data: { firstName: "Selin", lastName: "Koç", company: "XYZ Danışmanlık Ltd.", email: "selin@xyz.com", phone: "533 888 2233", type: "MUSTERI", customerId: customers["MUS002"] },
  });

  await prisma.opportunity.create({
    data: { title: "ABC Teknoloji - Yıllık BT Altyapı Yenileme", value: 500000, stage: "TEKLIF", probability: 60, expectedCloseDate: new Date("2025-03-01") },
  });
  await prisma.opportunity.create({
    data: { title: "Mega İnşaat - Şantiye Ekipman Tedariği", value: 250000, stage: "MUZAKERE", probability: 75, expectedCloseDate: new Date("2025-02-15") },
  });
  await prisma.opportunity.create({
    data: { title: "Star Lojistik - Depo Otomasyon Projesi", value: 180000, stage: "ADAY", probability: 20 },
  });
  console.log("✓ CRM verileri oluşturuldu");

  // BOM (Ürün Reçeteleri)
  const bom1 = await prisma.billOfMaterial.create({
    data: {
      bomNo: "BOM-001", productId: products["PRD001"], version: "1.0", status: "AKTIF",
      items: { create: [
        { materialId: products["PRD003"], quantity: 1, unit: "ADET", wastageRate: 2 },
        { materialId: products["PRD004"], quantity: 1, unit: "ADET", wastageRate: 1 },
        { materialId: products["PRD008"], quantity: 0.5, unit: "MT", wastageRate: 5 },
      ]},
    },
  });
  const bom2 = await prisma.billOfMaterial.create({
    data: {
      bomNo: "BOM-002", productId: products["PRD002"], version: "1.0", status: "AKTIF",
      items: { create: [
        { materialId: products["PRD007"], quantity: 2, unit: "MT", wastageRate: 3 },
        { materialId: products["PRD008"], quantity: 1, unit: "MT", wastageRate: 2 },
      ]},
    },
  });
  console.log("✓ Ürün reçeteleri oluşturuldu");

  // Üretim Emirleri
  await prisma.productionOrder.create({
    data: {
      orderNo: "UE-2025-001", bomId: bom1.id, quantity: 10,
      plannedStart: new Date("2025-01-10"), plannedEnd: new Date("2025-01-20"),
      status: "DEVAM", priority: "YUKSEK",
      lines: { create: [
        { materialId: products["PRD003"], requiredQty: 10, usedQty: 7 },
        { materialId: products["PRD004"], requiredQty: 10, usedQty: 6 },
      ]},
    },
  });
  await prisma.productionOrder.create({
    data: {
      orderNo: "UE-2025-002", bomId: bom2.id, quantity: 5,
      plannedStart: new Date("2025-02-01"), plannedEnd: new Date("2025-02-10"),
      status: "PLANLI", priority: "NORMAL",
    },
  });
  console.log("✓ Üretim emirleri oluşturuldu");

  // Kalite Kontrolleri
  await prisma.qualityInspection.create({
    data: {
      inspectionNo: "KK-2025-001", productId: products["PRD001"],
      inspectorName: "Mustafa Şahin", date: new Date("2025-01-18"),
      result: "GECTI", sampleSize: 3,
      items: { create: [
        { parameter: "Ağırlık", standard: "1.8-2.2 kg", actual: "2.0 kg", result: "GECTI" },
        { parameter: "Ekran Çözünürlüğü", standard: "1920x1080", actual: "1920x1080", result: "GECTI" },
        { parameter: "Pil Ömrü", standard: "Min 6 saat", actual: "7.5 saat", result: "GECTI" },
      ]},
    },
  });
  await prisma.qualityInspection.create({
    data: {
      inspectionNo: "KK-2025-002", productId: products["PRD007"],
      inspectorName: "Ali Öztürk", date: new Date("2025-01-25"),
      result: "KOSULLU", sampleSize: 5,
      items: { create: [
        { parameter: "Kalınlık", standard: "2.0 mm ± 0.1", actual: "2.15 mm", result: "KALDI" },
        { parameter: "Yüzey Kalitesi", standard: "Ra 1.6", actual: "Ra 1.4", result: "GECTI" },
      ]},
    },
  });
  console.log("✓ Kalite kontrolleri oluşturuldu");

  // Ekipmanlar
  const ekip1 = await prisma.maintenanceEquipment.create({
    data: { equipmentNo: "EKP-001", name: "CNC Torna Tezgahı", location: "Üretim Hattı A", manufacturer: "Mazak", model: "QTN-200", serialNo: "SN-2021-4455", installDate: new Date("2021-06-15"), status: "AKTIF" },
  });
  const ekip2 = await prisma.maintenanceEquipment.create({
    data: { equipmentNo: "EKP-002", name: "Hidrolik Pres", location: "Üretim Hattı B", manufacturer: "Ermaksan", model: "HP-300", serialNo: "SN-2020-3322", installDate: new Date("2020-03-10"), status: "AKTIF" },
  });
  await prisma.maintenanceEquipment.create({
    data: { equipmentNo: "EKP-003", name: "Forklift", location: "Ana Depo", manufacturer: "Toyota", model: "8FGCU25", serialNo: "SN-2022-7788", installDate: new Date("2022-09-01"), status: "BAKIM" },
  });
  console.log("✓ Ekipmanlar oluşturuldu");

  // Bakım Emirleri
  await prisma.maintenanceOrder.create({
    data: { orderNo: "BE-2025-001", equipmentId: ekip1.id, type: "PERIYODIK", priority: "NORMAL", description: "6 aylık periyodik bakım - yağ değişimi ve kalibrasyon", assignedTo: "Mustafa Şahin", plannedDate: new Date("2025-01-15"), status: "TAMAMLANDI", completedDate: new Date("2025-01-15"), cost: 5000 },
  });
  await prisma.maintenanceOrder.create({
    data: { orderNo: "BE-2025-002", equipmentId: ekip2.id, type: "ARIZA", priority: "ACIL", description: "Hidrolik silindir sızıntısı - acil onarım gerekli", assignedTo: "Ali Öztürk", plannedDate: new Date("2025-02-01"), status: "DEVAM", cost: 12000 },
  });
  console.log("✓ Bakım emirleri oluşturuldu");

  // Ayarlar
  const ayarlar = [
    { key: "firma_adi", value: "Demo ERP A.Ş.", group: "FIRMA" },
    { key: "firma_vergi_no", value: "1234567890", group: "FIRMA" },
    { key: "firma_vergi_dairesi", value: "Kadıköy", group: "FIRMA" },
    { key: "firma_adres", value: "İstanbul, Türkiye", group: "FIRMA" },
    { key: "varsayilan_kdv", value: "20", group: "FATURA" },
    { key: "fatura_serisi", value: "FTR", group: "FATURA" },
    { key: "para_birimi", value: "TRY", group: "GENEL" },
    { key: "dil", value: "tr", group: "GENEL" },
    { key: "kritik_stok_seviyesi", value: "10", group: "STOK" },
    { key: "varsayilan_depo", value: "Ana Depo", group: "STOK" },
  ];
  for (const a of ayarlar) {
    await prisma.setting.create({ data: a });
  }
  console.log("✓ Ayarlar oluşturuldu");

  console.log("\n✅ Tüm seed verileri başarıyla oluşturuldu!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

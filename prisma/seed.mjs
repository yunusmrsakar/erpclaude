import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, "dev.db");
const adapter = new PrismaLibSql({ url: `file:${dbPath}` });
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

  console.log("\n✅ Tüm seed verileri başarıyla oluşturuldu!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

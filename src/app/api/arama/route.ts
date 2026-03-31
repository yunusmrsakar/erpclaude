import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (q.length < 2) return NextResponse.json([]);

  const [products, customers, suppliers, employees, invoices, equipment] = await Promise.all([
    prisma.product.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 5 }),
    prisma.customer.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 5 }),
    prisma.supplier.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 5 }),
    prisma.employee.findMany({ where: { OR: [{ firstName: { contains: q, mode: "insensitive" } }, { lastName: { contains: q, mode: "insensitive" } }] }, take: 5 }),
    prisma.invoice.findMany({ where: { invoiceNo: { contains: q, mode: "insensitive" } }, take: 5 }),
    prisma.maintenanceEquipment.findMany({ where: { name: { contains: q, mode: "insensitive" } }, take: 5 }),
  ]);

  const results = [
    ...products.map(p => ({ type: "Urun", label: p.name, href: "/stok/urunler" })),
    ...customers.map(c => ({ type: "Musteri", label: c.name, href: "/satis/musteriler" })),
    ...suppliers.map(s => ({ type: "Tedarikci", label: s.name, href: "/satin-alma/tedarikciler" })),
    ...employees.map(e => ({ type: "Calisan", label: `${e.firstName} ${e.lastName}`, href: "/ik/calisanlar" })),
    ...invoices.map(i => ({ type: "Fatura", label: i.invoiceNo, href: "/finans/faturalar" })),
    ...equipment.map(e => ({ type: "Ekipman", label: e.name, href: "/bakim/ekipmanlar" })),
  ];

  return NextResponse.json(results);
}

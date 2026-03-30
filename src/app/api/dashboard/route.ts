export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    customerCount,
    supplierCount,
    employeeCount,
    productCount,
    invoiceStats,
    salesOrderStats,
    recentInvoices,
    lowStockProducts,
    pendingLeaves,
  ] = await Promise.all([
    prisma.customer.count({ where: { isActive: true } }),
    prisma.supplier.count({ where: { isActive: true } }),
    prisma.employee.count({ where: { status: "AKTIF" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.invoice.aggregate({
      where: { status: { not: "IPTAL" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.salesOrder.aggregate({
      where: { status: { not: "IPTAL" } },
      _sum: { total: true },
      _count: true,
    }),
    prisma.invoice.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true, supplier: true },
    }),
    prisma.stockLevel.findMany({
      where: { quantity: { lt: 10 } },
      include: { product: true, warehouse: true },
      take: 5,
    }),
    prisma.leave.count({ where: { status: "BEKLEMEDE" } }),
  ]);

  return NextResponse.json({
    musteriSayisi: customerCount,
    tedarikciSayisi: supplierCount,
    calisanSayisi: employeeCount,
    urunSayisi: productCount,
    toplamFatura: invoiceStats._sum.total || 0,
    faturaSayisi: invoiceStats._count,
    toplamSiparis: salesOrderStats._sum.total || 0,
    siparisSayisi: salesOrderStats._count,
    sonFaturalar: recentInvoices,
    dusukStok: lowStockProducts,
    bekleyenIzin: pendingLeaves,
  });
}

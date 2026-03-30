export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "finansal") {
      const [invoices, salesOrders] = await Promise.all([
        prisma.invoice.findMany(),
        prisma.salesOrder.findMany(),
      ]);

      const totalIncome = invoices
        .filter((i) => i.type === "SATIS")
        .reduce((sum, i) => sum + i.total, 0);

      const totalExpenses = invoices
        .filter((i) => i.type === "ALIS")
        .reduce((sum, i) => sum + i.total, 0);

      const invoiceCountByStatus = invoices.reduce(
        (acc, i) => {
          acc[i.status] = (acc[i.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return NextResponse.json({
        totalIncome,
        totalExpenses,
        netProfit: totalIncome - totalExpenses,
        invoiceCount: invoices.length,
        invoiceCountByStatus,
        salesOrderTotal: salesOrders.reduce((sum, o) => sum + o.total, 0),
      });
    }

    if (type === "stok") {
      const [products, stockLevels, stockMovements] = await Promise.all([
        prisma.product.findMany({ where: { isActive: true } }),
        prisma.stockLevel.findMany({ include: { product: true } }),
        prisma.stockMovement.findMany(),
      ]);

      const totalStockValue = stockLevels.reduce(
        (sum, sl) => sum + sl.quantity * sl.product.purchasePrice,
        0
      );

      const lowStockCount = stockLevels.filter((sl) => sl.quantity < 10).length;

      const movementsByType = stockMovements.reduce(
        (acc, m) => {
          acc[m.type] = (acc[m.type] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return NextResponse.json({
        totalProducts: products.length,
        lowStockCount,
        totalStockValue,
        movementsByType,
        totalStockItems: stockLevels.reduce((sum, sl) => sum + sl.quantity, 0),
      });
    }

    if (type === "satis") {
      const [salesOrders, customers] = await Promise.all([
        prisma.salesOrder.findMany({ include: { customer: true } }),
        prisma.customer.findMany({ where: { isActive: true } }),
      ]);

      const totalSales = salesOrders.reduce((sum, o) => sum + o.total, 0);

      const orderCountByStatus = salesOrders.reduce(
        (acc, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const customerRevenue = salesOrders.reduce(
        (acc, o) => {
          const name = o.customer?.name || "Bilinmeyen";
          acc[name] = (acc[name] || 0) + o.total;
          return acc;
        },
        {} as Record<string, number>
      );

      const topCustomers = Object.entries(customerRevenue)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, revenue]) => ({ name, revenue }));

      return NextResponse.json({
        totalSales,
        orderCount: salesOrders.length,
        orderCountByStatus,
        topCustomers,
        customerCount: customers.length,
      });
    }

    return NextResponse.json(
      { error: "Geçersiz rapor türü. Geçerli türler: finansal, stok, satis" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Rapor verileri yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Rapor verileri yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

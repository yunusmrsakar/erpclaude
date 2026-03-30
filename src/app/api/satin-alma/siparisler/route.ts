export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Satın alma siparişleri yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Satın alma siparişleri yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNo, supplierId, date, notes, lines } = body;

    if (!orderNo || !supplierId || !date || !lines || lines.length === 0) {
      return NextResponse.json(
        { error: "Sipariş no, tedarikçi, tarih ve en az bir kalem zorunludur" },
        { status: 400 }
      );
    }

    const existing = await prisma.purchaseOrder.findUnique({ where: { orderNo } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu sipariş numarası zaten kullanılıyor" },
        { status: 400 }
      );
    }

    let subtotal = 0;
    let taxAmount = 0;

    const processedLines = lines.map(
      (line: { productId: string; quantity: number; unitPrice: number; taxRate: number }) => {
        const lineSubtotal = line.quantity * line.unitPrice;
        const lineTax = lineSubtotal * (line.taxRate / 100);
        const lineTotal = lineSubtotal + lineTax;
        subtotal += lineSubtotal;
        taxAmount += lineTax;

        return {
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          total: lineTotal,
        };
      }
    );

    const total = subtotal + taxAmount;

    const order = await prisma.purchaseOrder.create({
      data: {
        orderNo,
        supplierId,
        date: new Date(date),
        status: "TASLAK",
        subtotal,
        taxAmount,
        total,
        notes: notes || null,
        lines: {
          create: processedLines,
        },
      },
      include: {
        supplier: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Satın alma siparişi oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Satın alma siparişi oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

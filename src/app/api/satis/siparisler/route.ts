export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.salesOrder.findMany({
      include: {
        customer: true,
        lines: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Satış siparişleri yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Satış siparişleri yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderNo, customerId, date, deliveryDate, status, notes, lines } = body;

    if (!orderNo || !customerId || !date) {
      return NextResponse.json(
        { error: "Sipariş no, müşteri ve tarih zorunludur" },
        { status: 400 }
      );
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json(
        { error: "En az bir sipariş kalemi gereklidir" },
        { status: 400 }
      );
    }

    const existing = await prisma.salesOrder.findUnique({
      where: { orderNo },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Bu sipariş numarası zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const subtotal = lines.reduce(
      (sum: number, l: { quantity: number; unitPrice: number }) =>
        sum + l.quantity * l.unitPrice,
      0
    );
    const taxAmount = lines.reduce(
      (sum: number, l: { quantity: number; unitPrice: number; taxRate: number }) =>
        sum + l.quantity * l.unitPrice * (l.taxRate / 100),
      0
    );
    const total = subtotal + taxAmount;

    const order = await prisma.salesOrder.create({
      data: {
        orderNo,
        customerId,
        date: new Date(date),
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        status: status || "TASLAK",
        subtotal,
        taxAmount,
        total,
        notes: notes || null,
        lines: {
          create: lines.map(
            (line: {
              productId: string;
              quantity: number;
              unitPrice: number;
              taxRate: number;
            }) => ({
              productId: line.productId,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              taxRate: line.taxRate,
              total: line.quantity * line.unitPrice * (1 + line.taxRate / 100),
            })
          ),
        },
      },
      include: {
        customer: true,
        lines: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Satış siparişi oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Satış siparişi oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

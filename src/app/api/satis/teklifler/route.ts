export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const quotations = await prisma.quotation.findMany({
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

    return NextResponse.json(quotations);
  } catch (error) {
    console.error("Teklifler yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Teklifler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quotationNo, customerId, date, validUntil, status, lines } = body;

    if (!quotationNo || !customerId || !date) {
      return NextResponse.json(
        { error: "Teklif no, müşteri ve tarih zorunludur" },
        { status: 400 }
      );
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json(
        { error: "En az bir teklif kalemi gereklidir" },
        { status: 400 }
      );
    }

    const existing = await prisma.quotation.findUnique({
      where: { quotationNo },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Bu teklif numarası zaten kullanılıyor" },
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

    const quotation = await prisma.quotation.create({
      data: {
        quotationNo,
        customerId,
        date: new Date(date),
        validUntil: new Date(validUntil || date),
        status: status || "TASLAK",
        subtotal,
        taxAmount,
        total,
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

    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    console.error("Teklif oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Teklif oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

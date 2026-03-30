export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        customer: true,
        supplier: true,
        lines: {
          include: { product: true },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error("Faturalar yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Faturalar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceNo, type, customerId, supplierId, date, dueDate, notes, lines } = body;

    if (!invoiceNo || !type || !date || !dueDate) {
      return NextResponse.json(
        { error: "Fatura no, tür, tarih ve vade tarihi zorunludur" },
        { status: 400 }
      );
    }

    if (type === "SATIS" && !customerId) {
      return NextResponse.json(
        { error: "Satış faturası için müşteri seçimi zorunludur" },
        { status: 400 }
      );
    }

    if (type === "ALIS" && !supplierId) {
      return NextResponse.json(
        { error: "Alış faturası için tedarikçi seçimi zorunludur" },
        { status: 400 }
      );
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json(
        { error: "En az bir fatura kalemi gereklidir" },
        { status: 400 }
      );
    }

    const existing = await prisma.invoice.findUnique({
      where: { invoiceNo },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Bu fatura numarası zaten kullanılıyor" },
        { status: 400 }
      );
    }

    // Toplamları hesapla
    let subtotal = 0;
    let taxAmount = 0;

    const processedLines = lines.map(
      (line: {
        productId?: string;
        description: string;
        quantity: number;
        unitPrice: number;
        taxRate: number;
      }) => {
        const lineSubtotal = line.quantity * line.unitPrice;
        const lineTax = lineSubtotal * (line.taxRate / 100);
        const lineTotal = lineSubtotal + lineTax;
        subtotal += lineSubtotal;
        taxAmount += lineTax;
        return {
          productId: line.productId || null,
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          total: lineTotal,
        };
      }
    );

    const total = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNo,
        type,
        customerId: type === "SATIS" ? customerId : null,
        supplierId: type === "ALIS" ? supplierId : null,
        date: new Date(date),
        dueDate: new Date(dueDate),
        subtotal,
        taxAmount,
        total,
        notes: notes || null,
        lines: {
          create: processedLines,
        },
      },
      include: {
        customer: true,
        supplier: true,
        lines: { include: { product: true } },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error("Fatura oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Fatura oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

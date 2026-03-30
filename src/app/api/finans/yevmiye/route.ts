export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.journalEntry.findMany({
      include: {
        lines: {
          include: {
            account: true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Yevmiye kayıtları yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Yevmiye kayıtları yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entryNo, date, description, status, lines } = body;

    if (!entryNo || !date || !description) {
      return NextResponse.json(
        { error: "Fiş no, tarih ve açıklama zorunludur" },
        { status: 400 }
      );
    }

    if (!lines || lines.length === 0) {
      return NextResponse.json(
        { error: "En az bir satır gereklidir" },
        { status: 400 }
      );
    }

    // Borç-alacak eşitlik kontrolü
    const totalDebit = lines.reduce(
      (sum: number, l: { debit: number }) => sum + (l.debit || 0),
      0
    );
    const totalCredit = lines.reduce(
      (sum: number, l: { credit: number }) => sum + (l.credit || 0),
      0
    );

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        {
          error: `Borç (${totalDebit.toFixed(2)}) ve alacak (${totalCredit.toFixed(2)}) toplamları eşit olmalıdır`,
        },
        { status: 400 }
      );
    }

    const existing = await prisma.journalEntry.findUnique({
      where: { entryNo },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Bu fiş numarası zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const entry = await prisma.journalEntry.create({
      data: {
        entryNo,
        date: new Date(date),
        description,
        status: status || "TASLAK",
        lines: {
          create: lines.map(
            (line: {
              accountId: string;
              debit: number;
              credit: number;
              description?: string;
            }) => ({
              accountId: line.accountId,
              debit: line.debit || 0,
              credit: line.credit || 0,
              description: line.description || null,
            })
          ),
        },
      },
      include: {
        lines: {
          include: { account: true },
        },
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error("Yevmiye kaydı oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Yevmiye kaydı oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

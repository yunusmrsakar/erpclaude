export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const movements = await prisma.stockMovement.findMany({
      include: {
        product: true,
        warehouse: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(movements);
  } catch (error) {
    console.error("Stok hareketleri yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Stok hareketleri yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, warehouseId, type, quantity, referenceType, referenceId, date, notes } = body;

    if (!productId || !warehouseId || !type || !quantity) {
      return NextResponse.json(
        { error: "Ürün, depo, hareket tipi ve miktar zorunludur" },
        { status: 400 }
      );
    }

    const parsedQuantity = parseFloat(quantity);

    if (type === "CIKIS") {
      const currentStock = await prisma.stockLevel.findUnique({
        where: {
          productId_warehouseId: { productId, warehouseId },
        },
      });

      if (!currentStock || currentStock.quantity < parsedQuantity) {
        return NextResponse.json(
          { error: "Yetersiz stok miktarı" },
          { status: 400 }
        );
      }
    }

    const movement = await prisma.stockMovement.create({
      data: {
        productId,
        warehouseId,
        type,
        quantity: parsedQuantity,
        referenceType: referenceType || null,
        referenceId: referenceId || null,
        date: date ? new Date(date) : new Date(),
        notes: notes || null,
      },
      include: {
        product: true,
        warehouse: true,
      },
    });

    const quantityChange = type === "CIKIS" ? -parsedQuantity : parsedQuantity;

    await prisma.stockLevel.upsert({
      where: {
        productId_warehouseId: { productId, warehouseId },
      },
      update: {
        quantity: { increment: quantityChange },
      },
      create: {
        productId,
        warehouseId,
        quantity: quantityChange,
      },
    });

    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    console.error("Stok hareketi oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Stok hareketi oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

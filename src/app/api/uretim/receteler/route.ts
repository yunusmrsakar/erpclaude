export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.billOfMaterial.findMany({
      include: {
        product: true,
        items: {
          include: {
            material: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Reçeteler yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Reçeteler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bomNo, productId, version, notes, items } = body;

    if (!bomNo || !productId || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Reçete no, ürün ve en az bir malzeme zorunludur" },
        { status: 400 }
      );
    }

    const existing = await prisma.billOfMaterial.findUnique({ where: { bomNo } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu reçete numarası zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const bom = await prisma.billOfMaterial.create({
      data: {
        bomNo,
        productId,
        version: version || "1.0",
        status: "TASLAK",
        notes: notes || null,
        items: {
          create: items.map(
            (item: { materialId: string; quantity: number; unit: string; wastageRate: number }) => ({
              materialId: item.materialId,
              quantity: item.quantity,
              unit: item.unit,
              wastageRate: item.wastageRate || 0,
            })
          ),
        },
      },
      include: {
        product: true,
        items: {
          include: {
            material: true,
          },
        },
      },
    });

    return NextResponse.json(bom, { status: 201 });
  } catch (error) {
    console.error("Reçete oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Reçete oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

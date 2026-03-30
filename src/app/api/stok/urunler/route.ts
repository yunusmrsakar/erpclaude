export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        stockLevels: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Ürünler yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Ürünler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sku, name, description, categoryId, unit, purchasePrice, salePrice, taxRate } = body;

    if (!sku || !name || !unit) {
      return NextResponse.json(
        { error: "SKU, ürün adı ve birim zorunludur" },
        { status: 400 }
      );
    }

    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu SKU kodu zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku,
        name,
        description: description || null,
        categoryId: categoryId || null,
        unit,
        purchasePrice: purchasePrice ? parseFloat(purchasePrice) : 0,
        salePrice: salePrice ? parseFloat(salePrice) : 0,
        taxRate: taxRate ? parseFloat(taxRate) : 18,
        isActive: true,
      },
      include: {
        category: true,
        stockLevels: true,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Ürün oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Ürün oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

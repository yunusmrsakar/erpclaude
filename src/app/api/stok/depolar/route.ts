export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: { stockLevels: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(warehouses);
  } catch (error) {
    console.error("Depolar yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Depolar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Depo adı zorunludur" },
        { status: 400 }
      );
    }

    const warehouse = await prisma.warehouse.create({
      data: {
        name,
        address: address || null,
        isActive: true,
      },
      include: {
        _count: {
          select: { stockLevels: true },
        },
      },
    });

    return NextResponse.json(warehouse, { status: 201 });
  } catch (error) {
    console.error("Depo oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Depo oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

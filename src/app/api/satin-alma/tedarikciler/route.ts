export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.error("Tedarikçiler yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Tedarikçiler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, taxNumber, taxOffice, address, city, phone, email, contactPerson } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: "Tedarikçi kodu ve adı zorunludur" },
        { status: 400 }
      );
    }

    const existing = await prisma.supplier.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu tedarikçi kodu zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const supplier = await prisma.supplier.create({
      data: {
        code,
        name,
        taxNumber: taxNumber || null,
        taxOffice: taxOffice || null,
        address: address || null,
        city: city || null,
        phone: phone || null,
        email: email || null,
        contactPerson: contactPerson || null,
        isActive: true,
      },
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    console.error("Tedarikçi oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Tedarikçi oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

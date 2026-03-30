export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("Müşteriler yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Müşteriler yüklenirken hata oluştu" },
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
        { error: "Müşteri kodu ve adı zorunludur" },
        { status: 400 }
      );
    }

    const existing = await prisma.customer.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu müşteri kodu zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const customer = await prisma.customer.create({
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

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    console.error("Müşteri oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Müşteri oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

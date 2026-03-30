export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      include: {
        customer: true,
        supplier: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Kişiler yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Kişiler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, company, email, phone, type, notes, customerId, supplierId } = body;

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "Ad ve soyad zorunludur" },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        firstName,
        lastName,
        company: company || null,
        email: email || null,
        phone: phone || null,
        type: type || "DIGER",
        notes: notes || null,
        customerId: customerId || null,
        supplierId: supplierId || null,
      },
      include: {
        customer: true,
        supplier: true,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    console.error("Kişi oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Kişi oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

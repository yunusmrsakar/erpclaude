export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const opportunities = await prisma.opportunity.findMany({
      include: {
        contact: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(opportunities);
  } catch (error) {
    console.error("Fırsatlar yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Fırsatlar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, contactId, value, stage, probability, expectedCloseDate, notes } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Fırsat başlığı zorunludur" },
        { status: 400 }
      );
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        contactId: contactId || null,
        value: value ? parseFloat(value) : 0,
        stage: stage || "ADAY",
        probability: probability ? parseInt(probability) : 10,
        expectedCloseDate: expectedCloseDate ? new Date(expectedCloseDate) : null,
        notes: notes || null,
      },
      include: {
        contact: true,
      },
    });

    return NextResponse.json(opportunity, { status: 201 });
  } catch (error) {
    console.error("Fırsat oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Fırsat oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

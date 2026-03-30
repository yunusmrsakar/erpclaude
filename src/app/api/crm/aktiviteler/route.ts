export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        contact: true,
        opportunity: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("Aktiviteler yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Aktiviteler yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, subject, contactId, opportunityId, date, notes, isCompleted } = body;

    if (!type || !subject || !date) {
      return NextResponse.json(
        { error: "Aktivite türü, konu ve tarih zorunludur" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        subject,
        contactId: contactId || null,
        opportunityId: opportunityId || null,
        date: new Date(date),
        notes: notes || null,
        isCompleted: isCompleted || false,
      },
      include: {
        contact: true,
        opportunity: true,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Aktivite oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Aktivite oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

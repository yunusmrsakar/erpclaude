export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const leaves = await prisma.leave.findMany({
    include: {
      employee: {
        select: { id: true, firstName: true, lastName: true, employeeNo: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leaves);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const employee = await prisma.employee.findUnique({
      where: { id: body.employeeId },
    });

    if (!employee) {
      return NextResponse.json(
        { error: "Çalışan bulunamadı." },
        { status: 404 }
      );
    }

    const leave = await prisma.leave.create({
      data: {
        employeeId: body.employeeId,
        type: body.type,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        status: "BEKLEMEDE",
        notes: body.notes || null,
      },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeNo: true },
        },
      },
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error("İzin oluşturma hatası:", error);
    return NextResponse.json(
      { error: "İzin talebi oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.id || !["ONAYLANDI", "REDDEDILDI"].includes(body.status)) {
      return NextResponse.json(
        { error: "Geçersiz istek. id ve status (ONAYLANDI/REDDEDILDI) gereklidir." },
        { status: 400 }
      );
    }

    const leave = await prisma.leave.findUnique({ where: { id: body.id } });

    if (!leave) {
      return NextResponse.json({ error: "İzin talebi bulunamadı." }, { status: 404 });
    }

    if (leave.status !== "BEKLEMEDE") {
      return NextResponse.json(
        { error: "Sadece beklemede olan talepler güncellenebilir." },
        { status: 400 }
      );
    }

    const updated = await prisma.leave.update({
      where: { id: body.id },
      data: { status: body.status },
      include: {
        employee: {
          select: { id: true, firstName: true, lastName: true, employeeNo: true },
        },
      },
    });

    // If approved, update employee status to IZINLI
    if (body.status === "ONAYLANDI") {
      const today = new Date();
      const startDate = new Date(updated.startDate);
      const endDate = new Date(updated.endDate);

      if (today >= startDate && today <= endDate) {
        await prisma.employee.update({
          where: { id: updated.employeeId },
          data: { status: "IZINLI" },
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("İzin güncelleme hatası:", error);
    return NextResponse.json(
      { error: "İzin talebi güncellenirken bir hata oluştu." },
      { status: 500 }
    );
  }
}

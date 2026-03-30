export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const employees = await prisma.employee.findMany({
    include: { department: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(employees);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const existing = await prisma.employee.findFirst({
      where: {
        OR: [
          { employeeNo: body.employeeNo },
          { tcKimlikNo: body.tcKimlikNo },
          { email: body.email },
        ],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu sicil no, TC kimlik no veya e-posta ile kayıtlı çalışan zaten mevcut." },
        { status: 400 }
      );
    }

    const employee = await prisma.employee.create({
      data: {
        employeeNo: body.employeeNo,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
        tcKimlikNo: body.tcKimlikNo,
        birthDate: new Date(body.birthDate),
        hireDate: new Date(body.hireDate),
        departmentId: body.departmentId,
        position: body.position,
        salary: parseFloat(body.salary),
        status: "AKTIF",
      },
      include: { department: true },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("Çalışan oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Çalışan oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const departments = await prisma.department.findMany({
    include: {
      _count: { select: { employees: true } },
      parent: true,
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(departments);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const existing = await prisma.department.findFirst({
      where: { name: body.name },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bu isimde bir departman zaten mevcut." },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        name: body.name,
        parentId: body.parentId || null,
        isActive: true,
      },
      include: {
        _count: { select: { employees: true } },
        parent: true,
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Departman oluşturma hatası:", error);
    return NextResponse.json(
      { error: "Departman oluşturulurken bir hata oluştu." },
      { status: 500 }
    );
  }
}

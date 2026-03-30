export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      include: {
        children: {
          include: {
            children: {
              include: {
                children: true,
              },
            },
          },
          orderBy: { code: "asc" },
        },
      },
      where: { parentId: null },
      orderBy: { code: "asc" },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("Hesaplar yüklenirken hata:", error);
    return NextResponse.json(
      { error: "Hesaplar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, type, parentId } = body;

    if (!code || !name || !type) {
      return NextResponse.json(
        { error: "Hesap kodu, adı ve türü zorunludur" },
        { status: 400 }
      );
    }

    const existing = await prisma.account.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json(
        { error: "Bu hesap kodu zaten kullanılıyor" },
        { status: 400 }
      );
    }

    const account = await prisma.account.create({
      data: {
        code,
        name,
        type,
        parentId: parentId || null,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("Hesap oluşturulurken hata:", error);
    return NextResponse.json(
      { error: "Hesap oluşturulurken hata oluştu" },
      { status: 500 }
    );
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.qualityInspection.findMany({
    include: { product: true, productionOrder: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { items, ...inspData } = body;
  const insp = await prisma.qualityInspection.create({
    data: { ...inspData, items: { create: items || [] } },
  });
  return NextResponse.json(insp, { status: 201 });
}

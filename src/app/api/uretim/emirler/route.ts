import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.productionOrder.findMany({
    include: { bom: { include: { product: true } }, lines: { include: { material: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { lines, ...orderData } = body;
  const order = await prisma.productionOrder.create({
    data: { ...orderData, lines: { create: lines || [] } },
  });
  return NextResponse.json(order, { status: 201 });
}

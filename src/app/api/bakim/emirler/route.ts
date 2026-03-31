import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.maintenanceOrder.findMany({
    include: { equipment: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const order = await prisma.maintenanceOrder.create({ data: body });
  return NextResponse.json(order, { status: 201 });
}

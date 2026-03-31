import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.maintenanceEquipment.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const equip = await prisma.maintenanceEquipment.create({ data: body });
  return NextResponse.json(equip, { status: 201 });
}

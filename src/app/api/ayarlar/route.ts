import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";

export async function GET() {
  const data = await prisma.setting.findMany({ orderBy: { group: "asc" } });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  const setting = await prisma.setting.upsert({
    where: { key: body.key },
    update: { value: body.value, group: body.group },
    create: body,
  });
  return NextResponse.json(setting);
}

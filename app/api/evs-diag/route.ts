import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getShipmentStatus } from "@/lib/evsExpress";

export const dynamic = "force-dynamic";

// Diagnostic temporar (admin): ce știe EVS despre AWB-urile salvate în aplicație.
export async function GET() {
  const user = await getSession();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const msgs = await prisma.contactMessage.findMany({
    where: { awbCode: { not: null } },
    select: { id: true, awbCode: true, awbCreatedAt: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
  const out: Record<string, unknown> = {
    envPresent: {
      user: Boolean(process.env.EVS_USERNAME),
      pass: Boolean(process.env.EVS_PASSWORD),
      branch: Boolean(process.env.EVS_SHIPPER_BRANCH_CODE),
      contact: Boolean(process.env.EVS_SHIPPER_CONTACT_PERSON_CODE),
      prefix: process.env.EVS_AWB_CUSTOMER_PREFIX ?? null,
      apiUrl: process.env.EVS_API_URL ?? "(default)",
      apiVersion: process.env.EVS_API_VERSION ?? "(default 3.1)",
    },
    awbs: msgs,
  };
  out.status = msgs.length ? await getShipmentStatus(msgs.map((m) => m.awbCode as string)[0]) : null;
  const perAwb: Record<string, unknown> = {};
  for (const m of msgs) perAwb[m.awbCode as string] = await getShipmentStatus(m.awbCode as string);
  out.perAwb = perAwb;
  return NextResponse.json(out);
}

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getShipmentStatus } from "@/lib/evsExpress";

export const dynamic = "force-dynamic";

async function evsRaw(method: string, query: Record<string, string>, body?: unknown) {
  const url = new URL(method, process.env.EVS_API_URL || "https://api.muvi.dev/Shipments/Local/");
  url.searchParams.set("username", process.env.EVS_USERNAME ?? "");
  url.searchParams.set("password", process.env.EVS_PASSWORD ?? "");
  url.searchParams.set("api", process.env.EVS_API_VERSION || "3.1");
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url.toString(), {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { http: res.status, body: text.slice(0, 1500) };
  } catch (e) {
    return { error: String(e) };
  }
}

// Diagnostic temporar (admin): ce știe EVS despre AWB-urile salvate în aplicație.
export async function GET() {
  const user = await getSession();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const msgs = await prisma.contactMessage.findMany({
    where: { awbCode: { not: null } },
    select: { awbCode: true, awbCreatedAt: true, name: true, phone: true, deliveryLocality: true, deliveryAddress: true, deliveryZip: true, deliveryWeightKg: true, deliveryCodAmount: true },
    orderBy: { createdAt: "desc" },
    take: 2,
  });
  const out: Record<string, unknown> = { orders: msgs };
  out.bogusAwbStatus = await getShipmentStatus("LUTZZZZZZZ0926");
  out.getDoc = {} as Record<string, unknown>;
  for (const m of msgs) {
    (out.getDoc as Record<string, unknown>)[m.awbCode as string] = await evsRaw("GetDoc", { type: "AWB", doc_code: m.awbCode as string, format: "JSON", size: "A4" });
  }
  (out.getDoc as Record<string, unknown>)["BOGUS"] = await evsRaw("GetDoc", { type: "AWB", doc_code: "LUTZZZZZZZ0926", format: "JSON", size: "A4" });
  // Forma răspunsului la o cerere de ÎNREGISTRARE cu date evident invalide (nu poate crea nimic real).
  out.recordWithInvalidData = await evsRaw(
    "CreateShipment",
    { method: "Standard", pickup: "1", type: "record" },
    [{
      Shipper: { Type: "Branch", Branch: { Code: process.env.EVS_SHIPPER_BRANCH_CODE, ContactPersonCode: process.env.EVS_SHIPPER_CONTACT_PERSON_CODE } },
      Receiver: { Type: "Custom", Custom: { Name: "TEST INVALID", ContactPersonName: "", InternalID: "", Phones: ["x"], Emails: [], AddressType: "Standard", AddressStandard: { Line_1: "test", Line_2: "", ZIP: "ABC", Comment: "" } } },
      AWB: "LUTZZZZZZZ0926", Service: 1, COD: { Type: "None", Amount: 0 }, DeclaredValue: 1,
      PayServiceAtDelivery: { Type: "None", Amount: 0 }, Labels: [{ Code: "LUTZZZZZZZ0926", Weight: 1, InternalCode: "" }],
      Weight: 1, AllowOpenParcel: false, Comment: "",
    }],
  );
  return NextResponse.json(out);
}

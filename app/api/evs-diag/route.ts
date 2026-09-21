import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Diagnostic temporar (admin): O SINGURĂ expediție de test reală, pickup=0 (fără preluare de curier).
export async function GET() {
  const user = await getSession();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const c = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let r = ""; for (let i = 0; i < 7; i++) r += c[Math.floor(Math.random() * c.length)];
  const d = new Date();
  const awb = `${process.env.EVS_AWB_CUSTOMER_PREFIX}${r}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getFullYear()).slice(-2)}`;

  const body = [{
    Shipper: { Type: "Branch", Branch: { Code: process.env.EVS_SHIPPER_BRANCH_CODE, ContactPersonCode: process.env.EVS_SHIPPER_CONTACT_PERSON_CODE } },
    Receiver: {
      Type: "Custom",
      Custom: {
        Name: "TEST Lumina (de anulat)", ContactPersonName: "", InternalID: "", Phones: ["068046719"], Emails: [],
        AddressType: "Standard", AddressStandard: { Line_1: "Chisinau, Stefan cel mare 16", Line_2: "", ZIP: "2093", Comment: "TEST - de anulat" },
      },
    },
    AWB: awb, Service: 1, COD: { Type: "None", Amount: 0 }, DeclaredValue: 1,
    PayServiceAtDelivery: { Type: "None", Amount: 0 },
    Labels: [{ Code: awb, Weight: 1, InternalCode: "" }],
    Weight: 1, AllowOpenParcel: false, Comment: "TEST - de anulat",
  }];

  const url = new URL("CreateShipment", process.env.EVS_API_URL || "https://api.muvi.dev/Shipments/Local/");
  url.searchParams.set("username", process.env.EVS_USERNAME ?? "");
  url.searchParams.set("password", process.env.EVS_PASSWORD ?? "");
  url.searchParams.set("api", process.env.EVS_API_VERSION || "3.1");
  url.searchParams.set("method", "Standard");
  url.searchParams.set("pickup", "0");
  url.searchParams.set("type", "record");
  const res = await fetch(url.toString(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const text = await res.text();
  return NextResponse.json({ awb, http: res.status, rawText: text.slice(0, 1500) });
}

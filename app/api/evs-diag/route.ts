import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Recv = { name: string; phone: string; email?: string; line1: string; line2?: string; zip: string };

function payload(awb: string, r: Recv, weight: number, cod: number) {
  return [{
    Shipper: { Type: "Branch", Branch: { Code: process.env.EVS_SHIPPER_BRANCH_CODE, ContactPersonCode: process.env.EVS_SHIPPER_CONTACT_PERSON_CODE } },
    Receiver: {
      Type: "Custom",
      Custom: {
        Name: r.name, ContactPersonName: "", InternalID: "", Phones: [r.phone], Emails: r.email ? [r.email] : [],
        AddressType: "Standard", AddressStandard: { Line_1: r.line1, Line_2: r.line2 ?? "", ZIP: r.zip, Comment: "" },
      },
    },
    AWB: awb, Service: 1,
    COD: cod > 0 ? { Type: "Fixed", Amount: cod } : { Type: "None", Amount: 0 },
    DeclaredValue: Math.max(1, Math.round(cod || 1)),
    PayServiceAtDelivery: { Type: "None", Amount: 0 },
    Labels: [{ Code: awb, Weight: weight, InternalCode: "" }],
    Weight: weight, AllowOpenParcel: false, Comment: "",
  }];
}

async function evs(type: "validate" | "record", pickup: string, body: unknown) {
  const url = new URL("CreateShipment", process.env.EVS_API_URL || "https://api.muvi.dev/Shipments/Local/");
  url.searchParams.set("username", process.env.EVS_USERNAME ?? "");
  url.searchParams.set("password", process.env.EVS_PASSWORD ?? "");
  url.searchParams.set("api", process.env.EVS_API_VERSION || "3.1");
  url.searchParams.set("method", "Standard");
  url.searchParams.set("pickup", pickup);
  url.searchParams.set("type", type);
  try {
    const res = await fetch(url.toString(), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const t = await res.text();
    try { return JSON.parse(t); } catch { return { http: res.status, text: t.slice(0, 400) }; }
  } catch (e) { return { error: String(e) }; }
}

function newAwb() {
  const c = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let r = ""; for (let i = 0; i < 7; i++) r += c[Math.floor(Math.random() * c.length)];
  const d = new Date();
  return `${process.env.EVS_AWB_CUSTOMER_PREFIX}${r}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getFullYear()).slice(-2)}`;
}

// Diagnostic temporar (admin). ?mode=validate (implicit, nu creează nimic) | ?mode=record (creează REAL, pickup=0)
export async function GET(req: NextRequest) {
  const user = await getSession();
  if (!user || !user.isAdmin) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const mode = req.nextUrl.searchParams.get("mode");

  const racu: Recv = { name: "Racu Stefan", phone: "068046719", line1: "Chisinau, Stefan cel mare 16", zip: "2093" };

  if (mode === "record") {
    const custom = req.nextUrl.searchParams.get("line1");
    const r: Recv = { ...racu, name: "TEST Lumina (de anulat)", line1: custom ?? racu.line1, zip: req.nextUrl.searchParams.get("zip") ?? racu.zip, phone: req.nextUrl.searchParams.get("phone") ?? racu.phone };
    const awb = newAwb();
    const res = await evs("record", "0", payload(awb, r, 1, 0));
    return NextResponse.json({ awb, sent: r, response: res });
  }

  const scenarios: Record<string, { awb: string; r: Recv; w: number; cod: number }> = {
    A_nou_date_Racu: { awb: newAwb(), r: racu, w: 19, cod: 1464 },
    B_awb_existent_Racu: { awb: "LUTCDK0XCD0926", r: racu, w: 19, cod: 1464 },
    C_awb_existent_Gheorghe: { awb: "LUTCKSRKEO0926", r: { name: "Gheorghe", phone: "+373 688 35 658", line1: "Chisinau, test livrare", zip: "463463463" }, w: 1, cod: 40 },
    D_telefon_plus373: { awb: newAwb(), r: { ...racu, phone: "+37368046719" }, w: 1, cod: 0 },
    E_zip_9cifre: { awb: newAwb(), r: { ...racu, zip: "463463463" }, w: 1, cod: 0 },
    F_telefon_spatii: { awb: newAwb(), r: { ...racu, phone: "+373 688 35 658" }, w: 1, cod: 0 },
    G_zip_2001: { awb: newAwb(), r: { ...racu, zip: "2001" }, w: 1, cod: 0 },
    H_greutate_19_fara_cod: { awb: newAwb(), r: racu, w: 19, cod: 0 },
  };
  const out: Record<string, unknown> = {};
  for (const [k, s] of Object.entries(scenarios)) out[k] = { awb: s.awb, res: await evs("validate", "1", payload(s.awb, s.r, s.w, s.cod)) };
  return NextResponse.json(out);
}

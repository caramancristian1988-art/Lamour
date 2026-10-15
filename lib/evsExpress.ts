// Client pentru EVS Express (Muvi) Shipments Local API v3.1.
// Documentație: docs/evs-express-api-3.1.pdf
//
// Notă: forma exactă a unui răspuns de SUCCES la /CreateShipment nu a fost
// niciodată observată live — am construit integrarea folosind doar
// "type=validate" (recomandat de documentație pentru testare, nu creează
// o expediție reală) ca să nu genereze o expediție reală neintenționat în
// timpul dezvoltării. Toate răspunsurile de eroare observate au forma
// { Code, TrueFalse: false, Description }, deci tratăm orice TrueFalse
// diferit de `false` ca succes și afișăm mereu Description brut adminului.

const DEFAULT_API_URL = "https://api.muvi.dev/Shipments/Local/";

interface EvsCredentials {
  username: string;
  password: string;
}

function getCredentials(): EvsCredentials | null {
  const username = process.env.EVS_USERNAME;
  const password = process.env.EVS_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}

interface ShipperBranch {
  code: string;
  contactPersonCode: string;
}

function getShipperBranch(): ShipperBranch | null {
  const code = process.env.EVS_SHIPPER_BRANCH_CODE;
  const contactPersonCode = process.env.EVS_SHIPPER_CONTACT_PERSON_CODE;
  if (!code || !contactPersonCode) return null;
  return { code, contactPersonCode };
}

function getApiUrl(): string {
  return process.env.EVS_API_URL || DEFAULT_API_URL;
}

function getApiVersion(): string {
  return process.env.EVS_API_VERSION || "3.1";
}

export interface EvsResult<T = unknown> {
  ok: boolean;
  description: string;
  raw: T | null;
  code?: string;
}

async function callEvs<T = unknown>(
  method: string,
  query: Record<string, string>,
  body?: unknown
): Promise<EvsResult<T>> {
  const creds = getCredentials();
  if (!creds) {
    return { ok: false, description: "Lipsesc EVS_USERNAME / EVS_PASSWORD din .env.", raw: null };
  }

  const url = new URL(method, getApiUrl());
  url.searchParams.set("username", creds.username);
  url.searchParams.set("password", creds.password);
  url.searchParams.set("api", getApiVersion());
  for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);

  try {
    const res = await fetch(url.toString(), {
      method: body ? "POST" : "GET",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      // Fără timeout, un EVS care nu răspunde bloca webhook-ul Telegram până la limita platformei (butonul apăsat "se rotea").
      signal: AbortSignal.timeout(20000),
    });
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : data;
    // Eșecurile reale de infrastructură vin ca HTTP 502 cu { status, error } — fără TrueFalse. Înainte,
    // lipsa lui TrueFalse:false era luată drept succes, deci se salva un AWB pe care EVS nu l-a creat niciodată.
    const proxyError = !res.ok || first?.error !== undefined || (typeof first?.status === "number" && first.status >= 400);
    const ok = !proxyError && first?.TrueFalse !== false;
    const description = proxyError
      ? `EVS Express a răspuns cu eroare (HTTP ${res.status}): ${first?.error ?? "necunoscută"}`
      : (first?.Description ?? (ok ? "OK" : "Eroare necunoscută de la EVS Express."));
    return { ok, description, raw: data, code: first?.Code !== undefined ? String(first.Code) : undefined };
  } catch (err) {
    return { ok: false, description: `Cerere eșuată către EVS Express: ${(err as Error).message}`, raw: null };
  }
}

// Format cerut de EVS: XXX[0-9A-Z]{7}MMYY (14 caractere).
// XXX = prefixul alocat de EVS Express contului nostru — vezi EVS_AWB_CUSTOMER_PREFIX.
function generateAwbNumber(): { awb: string } | { error: string } {
  const prefix = process.env.EVS_AWB_CUSTOMER_PREFIX;
  if (!prefix || prefix.length !== 3) {
    return {
      error:
        "Lipsește EVS_AWB_CUSTOMER_PREFIX (prefixul de 3 litere alocat de EVS Express contului LuminTehnica) din .env.",
    };
  }
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let random = "";
  for (let i = 0; i < 7; i++) random += chars[Math.floor(Math.random() * chars.length)];
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  return { awb: `${prefix.toUpperCase()}${random}${mm}${yy}` };
}

export interface EvsReceiverInput {
  name: string;
  phone: string;
  email?: string;
  line1: string;
  line2?: string;
  zip: string;
  comment?: string;
}

export interface CreateShipmentInput {
  receiver: EvsReceiverInput;
  weight: number;
  codAmount: number;
  comment?: string;
}

export interface CreateShipmentResult extends EvsResult {
  awb: string | null;
}

export async function createShipment(
  input: CreateShipmentInput,
  options: { validateOnly: boolean; pickup?: boolean }
): Promise<CreateShipmentResult> {
  const branch = getShipperBranch();
  if (!branch) {
    return {
      ok: false,
      description: "Lipsesc EVS_SHIPPER_BRANCH_CODE / EVS_SHIPPER_CONTACT_PERSON_CODE din .env.",
      raw: null,
      awb: null,
    };
  }

  const awbResult = generateAwbNumber();
  if ("error" in awbResult) {
    return { ok: false, description: awbResult.error, raw: null, awb: null };
  }
  const { awb } = awbResult;

  const payload = [
    {
      Shipper: { Type: "Branch", Branch: { Code: branch.code, ContactPersonCode: branch.contactPersonCode } },
      Receiver: {
        Type: "Custom",
        Custom: {
          Name: input.receiver.name,
          ContactPersonName: "",
          InternalID: "",
          Phones: [input.receiver.phone],
          Emails: input.receiver.email ? [input.receiver.email] : [],
          AddressType: "Standard",
          AddressStandard: {
            Line_1: input.receiver.line1,
            Line_2: input.receiver.line2 ?? "",
            ZIP: input.receiver.zip,
            Comment: input.receiver.comment ?? "",
          },
        },
      },
      AWB: awb,
      // EVS (1C) citește aceste câmpuri la înregistrarea reală și răspunde cu HTTP 502
      // "Object field not found (InternalID_1)" dacă lipsesc — type=validate NU le verifică,
      // de-asta validarea trecea, dar type=record eșua. Exemplul din documentație le include pe toate.
      InternalID_1: "",
      InternalID_2: "",
      Service: 1,
      COD: input.codAmount > 0 ? { Type: "Fixed", Amount: input.codAmount } : { Type: "None", Amount: 0 },
      DeclaredValue: Math.max(1, Math.round(input.codAmount || 1)),
      PayServiceAtDelivery: { Type: "None", Amount: 0 },
      ReturnDocsSpecification: "",
      Labels: [{ Code: awb, Weight: input.weight, InternalCode: "" }],
      Weight: input.weight,
      AllowOpenParcel: false,
      Comment: input.comment ?? "",
    },
  ];

  const result = await callEvs(
    "CreateShipment",
    { method: "Standard", pickup: options.pickup === false ? "0" : "1", type: options.validateOnly ? "validate" : "record" },
    payload
  );

  // Ciudățenie a API-ului: pentru type=validate, un răspuns FĂRĂ probleme
  // vine cu TrueFalse:false și Code:"3000" ("No issue found. Records not
  // registered. Turn off validator or debugger.") — nu e o eroare reală,
  // ci exact rezultatul dorit al unei validări. Alte coduri (3001, 3005,
  // 3017 etc.) rămân erori reale.
  const ok = options.validateOnly && result.code === "3000" ? true : result.ok;

  return { ...result, ok, awb: ok ? awb : null };
}

// Verifică statusul unui AWB deja creat. Întoarce ultimul status/acțiune
// cunoscute de EVS pentru acel AWB (GetGroupAWBActions, targetat pe un
// singur AWB — spre deosebire de GetAWBActions, care cere un interval de
// date pe TOATE expedițiile din cont).
// Marchează un AWB creat cu pickup=0 ca "gata de ridicare" (/ActivatePickUp) — de aici
// EVS trimite curierul. Documentația nu descrie forma răspunsului; ca în callEvs,
// la eșec afișăm Description brut.
export async function activatePickup(awb: string): Promise<EvsResult> {
  return callEvs("ActivatePickUp", {}, [{ AWB: awb }]);
}

// Anulează un AWB încă neridicat (/RemoveDoc type=AWB).
export async function removeShipment(awb: string): Promise<EvsResult> {
  return callEvs("RemoveDoc", { type: "AWB", doc_code: awb });
}

export async function getShipmentStatus(awb: string): Promise<EvsResult<unknown>> {
  return callEvs("GetGroupAWBActions", {}, [{ AWB: awb }]);
}

// Răspunsul real (verificat live) e imbricat: [[{ AWBNumber, Actions: [{ AWBStatus, ActionDate }] }]]
// — nu o listă plată cu "Status". Acțiunile vin în ordine cronologică, deci ultima e statusul curent.
export function parseLatestAwbStatus(raw: unknown): string | null {
  const flat = Array.isArray(raw) ? raw.flat(2) : [];
  const actions = flat.flatMap((entry) => (Array.isArray(entry?.Actions) ? entry.Actions : []));
  const last = actions[actions.length - 1];
  return typeof last?.AWBStatus === "string" && last.AWBStatus ? last.AWBStatus : null;
}

export async function fetchLatestAwbStatus(awb: string): Promise<string | null> {
  const result = await getShipmentStatus(awb);
  return result.ok ? parseLatestAwbStatus(result.raw) : null;
}

// Eticheta AWB (fișa de livrare cu cod de bare) pentru lipit pe colet — /GetDoc type=AWB format=PDF.
// "100x100" = etichetă pentru imprimantă termică, "A4" = fișă completă cu dovada livrării.
export type AwbLabelSize = "A4" | "100x100";

export async function getAwbLabel(
  awb: string,
  size: AwbLabelSize
): Promise<{ ok: true; pdf: Buffer } | { ok: false; description: string }> {
  const creds = getCredentials();
  if (!creds) return { ok: false, description: "Lipsesc EVS_USERNAME / EVS_PASSWORD din .env." };

  const url = new URL("GetDoc", getApiUrl());
  url.searchParams.set("username", creds.username);
  url.searchParams.set("password", creds.password);
  url.searchParams.set("api", getApiVersion());
  url.searchParams.set("type", "AWB");
  url.searchParams.set("doc_code", awb);
  url.searchParams.set("format", "PDF");
  url.searchParams.set("size", size);

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(20000) });
    const buf = Buffer.from(await res.arrayBuffer());
    if (res.ok && buf.subarray(0, 4).toString("latin1") === "%PDF") return { ok: true, pdf: buf };

    // La eroare EVS răspunde cu JSON { Code, TrueFalse:false, Description } (sau HTTP 502 { error }).
    let description = `EVS Express a răspuns cu HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(buf.toString("utf8"));
      const first = Array.isArray(parsed) ? parsed[0] : parsed;
      description = first?.Description ?? first?.error ?? description;
    } catch {
      // răspuns non-JSON — rămâne mesajul generic
    }
    return { ok: false, description };
  } catch (err) {
    return { ok: false, description: `Cerere eșuată către EVS Express: ${(err as Error).message}` };
  }
}

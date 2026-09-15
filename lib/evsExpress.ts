// Client pentru EVS Express (Muvi) Shipments Local API v3.1.
// Documentație: public/evs express api 3.1.pdf
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
    });
    const data = await res.json();
    const first = Array.isArray(data) ? data[0] : data;
    const ok = first?.TrueFalse !== false;
    const description = first?.Description ?? (ok ? "OK" : "Eroare necunoscută de la EVS Express.");
    return { ok, description, raw: data };
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
  options: { validateOnly: boolean }
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
      Service: 1,
      COD: input.codAmount > 0 ? { Type: "Fixed", Amount: input.codAmount } : { Type: "None", Amount: 0 },
      DeclaredValue: Math.max(1, Math.round(input.codAmount || 1)),
      PayServiceAtDelivery: { Type: "None", Amount: 0 },
      Labels: [{ Code: awb, Weight: input.weight, InternalCode: "" }],
      Weight: input.weight,
      AllowOpenParcel: false,
      Comment: input.comment ?? "",
    },
  ];

  const result = await callEvs(
    "CreateShipment",
    { method: "Standard", pickup: "1", type: options.validateOnly ? "validate" : "record" },
    payload
  );

  return { ...result, awb: result.ok ? awb : null };
}

// Verifică statusul unui AWB deja creat. Întoarce ultimul status/acțiune
// cunoscute de EVS pentru acel AWB (GetGroupAWBActions, targetat pe un
// singur AWB — spre deosebire de GetAWBActions, care cere un interval de
// date pe TOATE expedițiile din cont).
export async function getShipmentStatus(awb: string): Promise<EvsResult<{ Status?: string }[]>> {
  return callEvs<{ Status?: string }[]>("GetGroupAWBActions", {}, [{ AWB: awb }]);
}

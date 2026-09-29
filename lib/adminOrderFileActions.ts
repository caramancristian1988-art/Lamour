"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "./adminAuth";
import {
  parseOrderFile,
  createCartOrderFromParsedItems,
  OrderFileError,
  MAX_ORDER_FILE_BYTES,
  type ParsedOrderFile,
  type CreateOrderFromFileItem,
} from "./orderFileImport";

// Comandă nouă din fișier (Excel/CSV/PDF) — varianta din admin, cu pas de verificare înainte de creare
// (vezi app/admin/mesaje/OrderFromFileDialog.tsx). Varianta din Telegram e în webhook, direct pe orderFileImport.ts.

export async function analyzeOrderFileAction(formData: FormData): Promise<{ ok: true; data: ParsedOrderFile } | { ok: false; error: string }> {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Alege un fișier Excel (.xlsx/.csv) sau PDF." };
  if (file.size > MAX_ORDER_FILE_BYTES) return { ok: false, error: "Fișierul e prea mare (maxim 5 MB)." };
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await parseOrderFile(buffer, file.name);
    return { ok: true, data };
  } catch (err) {
    if (err instanceof OrderFileError) return { ok: false, error: err.message };
    console.error("analiza fișierului de comandă a eșuat:", err);
    return { ok: false, error: "Nu am putut citi fișierul. Încearcă din nou." };
  }
}

export interface CreateOrderFromFileFormInput {
  name: string;
  phone: string;
  email?: string;
  deliveryLocality?: string;
  deliveryAddress?: string;
  deliveryZip?: string;
  note?: string;
  filename?: string;
  items: CreateOrderFromFileItem[];
  needsInvoice?: boolean;
  companyName?: string;
  companyIdno?: string;
  companyAddress?: string;
  companyVat?: string;
}

// Comenzile din fișier pleacă direct la depozitar (nu au nevoie de confirmarea manuală din Telegram) —
// operatorul deja le-a verificat la pasul de review din dialog, la fel cum ar face-o apăsând "Confirmă".
export async function createOrderFromFileAction(
  input: CreateOrderFromFileFormInput
): Promise<{ ok: boolean; error?: string; orderNumber?: string | null }> {
  await requireAdmin();
  const note = input.note?.trim() || (input.filename ? `Comandă introdusă din fișierul „${input.filename}”.` : null);
  const result = await createCartOrderFromParsedItems({ ...input, note, autoConfirm: true });
  if (result.ok) revalidatePath("/admin/mesaje");
  return result;
}

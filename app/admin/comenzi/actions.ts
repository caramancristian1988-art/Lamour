"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import {
  prepareExport,
  confirmExport,
  cancelExport,
  setOrderArchived,
  type Actor,
} from "@/lib/orderRegistry";

// Răspuns simplu, serializabil, cu un mesaj GATA de anunțat de cititorul de ecran.
export interface ExportActionResult {
  ok: boolean;
  /** Mesaj complet, în română, pentru zona aria-live. */
  message: string;
  exportId?: string;
  exportNumber?: number;
  orderCount?: number;
  /** "created" | "resumed" | "none" | "confirmed" | "cancelled" | "closed" */
  kind?: string;
}

async function siteActor(): Promise<Actor> {
  const user = await requireAdmin();
  return { channel: "site", id: user.id, name: user.name || user.email };
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? `1 ${one}` : `${n} ${many}`;
}

export async function prepareExportAction(): Promise<ExportActionResult> {
  const actor = await siteActor();
  try {
    const result = await prepareExport(actor);
    revalidatePath("/admin/comenzi");
    if (result.kind === "none") {
      const others = result.active;
      if (others.length > 0) {
        const e = others[0];
        return {
          ok: true,
          kind: "none",
          message: `Nu există comenzi noi pentru extragere. Există însă un export în curs, numărul ${e.number}, cu ${plural(e.orderCount, "comandă", "comenzi")}, pornit de ${e.initiatedByName}. Îl puteți relua din secțiunea Exporturi în curs.`,
        };
      }
      return { ok: true, kind: "none", message: "Nu există comenzi noi pentru extragere." };
    }
    const e = result.export;
    const verb = result.kind === "resumed" ? "Ați reluat exportul început anterior" : "Exportul a fost pregătit";
    return {
      ok: true,
      kind: result.kind,
      exportId: e.id,
      exportNumber: e.number,
      orderCount: e.orderCount,
      message: `${verb}, numărul ${e.number}. Conține ${plural(e.orderCount, "comandă", "comenzi")}. Descărcați fișierul, apoi confirmați extragerea.`,
    };
  } catch (err) {
    console.error("registru: pregătirea exportului a eșuat:", err);
    return { ok: false, message: "Eroare. Exportul nu a putut fi pregătit. Comenzile sunt păstrate. Încercați din nou." };
  }
}

export async function confirmExportAction(exportId: string): Promise<ExportActionResult> {
  const actor = await siteActor();
  try {
    const result = await confirmExport(exportId, actor);
    revalidatePath("/admin/comenzi");
    if (result.kind === "confirmed") {
      const n = result.orderCount;
      return {
        ok: true,
        kind: "confirmed",
        exportId,
        orderCount: n,
        message: result.alreadyConfirmed
          ? `Acest export era deja confirmat. ${plural(n, "comandă este marcată", "comenzi sunt marcate")} ca extrase.`
          : `Extragerea a fost confirmată. ${plural(n, "comandă a fost marcată", "comenzi au fost marcate")} ca extrase.`,
      };
    }
    if (result.kind === "closed") {
      return { ok: false, kind: "closed", message: `Eroare. Exportul nu mai poate fi confirmat, are statusul: ${result.statusLabel.toLowerCase()}. Pregătiți un export nou.` };
    }
    return { ok: false, message: "Eroare. Exportul nu a fost găsit." };
  } catch (err) {
    console.error("registru: confirmarea exportului a eșuat:", err);
    return { ok: false, message: "Eroare. Exportul nu a fost confirmat. Comenzile sunt păstrate. Încercați din nou." };
  }
}

export async function cancelExportAction(exportId: string): Promise<ExportActionResult> {
  const actor = await siteActor();
  try {
    const result = await cancelExport(exportId, actor);
    revalidatePath("/admin/comenzi");
    if (result.kind === "cancelled") {
      return {
        ok: true,
        kind: "cancelled",
        message: `Exportul a fost anulat. ${plural(result.released, "comandă a revenit", "comenzi au revenit")} la statusul neextrasă.`,
      };
    }
    if (result.kind === "closed") {
      return { ok: false, kind: "closed", message: `Exportul nu mai poate fi anulat, are statusul: ${result.statusLabel.toLowerCase()}.` };
    }
    return { ok: false, message: "Eroare. Exportul nu a fost găsit." };
  } catch (err) {
    console.error("registru: anularea exportului a eșuat:", err);
    return { ok: false, message: "Eroare. Exportul nu a putut fi anulat. Încercați din nou." };
  }
}

export async function archiveOrderAction(formData: FormData): Promise<void> {
  const actor = await siteActor();
  const id = String(formData.get("id") ?? "");
  const archived = formData.get("archived") === "true";
  if (!id) return;
  await setOrderArchived(id, archived, actor);
  revalidatePath("/admin/comenzi");
  revalidatePath(`/admin/comenzi/${id}`);
  revalidatePath("/admin/mesaje");
}

// Citește textul unei comenzi din coș (scris de CheckoutPanel) și îl desparte în părți: produse, sumar, adresă,
// factură, mesaj client. Folosit de mesajul din Telegram (lib/telegram.ts) și de pagina de tipărire — o singură
// implementare, ca cele două să nu se poată diferenția. Textul stocat rămâne neschimbat (orderExport și admin îl citesc).
// Fără dependențe de server: poate fi importat oriunde.

export interface ParsedOrderItem {
  name: string;
  qty?: string;
  unit?: string;
  total?: string;
  note?: string;
}

export interface ParsedCartOrder {
  items: ParsedOrderItem[];
  totals: { subtotal?: string; savings?: string; delivery?: string; deliveryLabel?: string; total?: string };
  address: string | null;
  invoice: string[];
  clientNote: string;
}

// Întoarce null dacă întâlnește o linie necunoscută sau nu găsește niciun produs — apelantul folosește atunci
// formatul vechi, ca nicio comandă să nu se piardă din cauza unei diferențe de format.
export function parseCartOrderMessage(raw: string): ParsedCartOrder | null {
  const items: ParsedOrderItem[] = [];
  const totals: ParsedCartOrder["totals"] = {};
  let address: string | null = null;
  const invoice: string[] = [];
  const clientNote: string[] = [];
  let mode: "items" | "invoice" | "note" | "other" = "other";

  for (const line of raw.split("\n")) {
    const t = line.trim();
    let m: RegExpMatchArray | null;
    if (mode === "note") { clientNote.push(line); continue; }
    if (!t) { if (mode === "invoice") mode = "other"; continue; }
    if (t.startsWith("Produse comandate")) { mode = "items"; continue; }
    if (t.startsWith("🧾 CERE FACTURĂ")) { mode = "invoice"; continue; }
    if ((m = t.match(/^Mesaj client:\s*(.*)$/))) { mode = "note"; clientNote.push(m[1]); continue; }
    if ((m = t.match(/^Subtotal:\s*(.+)$/))) { totals.subtotal = m[1]; mode = "other"; continue; }
    if ((m = t.match(/^Economisește:\s*(.+)$/))) { totals.savings = m[1]; continue; }
    if ((m = t.match(/^Livrare \((.+?)\):\s*(.+)$/))) { totals.deliveryLabel = m[1]; totals.delivery = m[2]; continue; }
    if ((m = t.match(/^Total cu livrare:\s*(.+)$/))) { totals.total = m[1]; continue; }
    if ((m = t.match(/^Livrare:\s*(.+)$/))) { address = m[1]; mode = "other"; continue; }
    if (mode === "invoice") { invoice.push(t); continue; }
    if (mode === "items") {
      if ((m = t.match(/^•\s*(.+)$/))) { items.push({ name: m[1] }); continue; }
      if ((m = t.match(/^(\d+) buc × (.+?) = (.+?)(?: \((.+)\))?$/)) && items.length > 0) {
        Object.assign(items[items.length - 1], { qty: m[1], unit: m[2], total: m[3], note: m[4] });
        continue;
      }
    }
    return null;
  }
  if (items.length === 0) return null;
  return { items, totals, address, invoice, clientNote: clientNote.join("\n").trim() };
}

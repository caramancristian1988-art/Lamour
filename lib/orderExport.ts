import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";
import { prisma } from "./prisma";
import { orderStageLabel, type OrderStage } from "./orderStages";

export interface OrderExportRow {
  id: string;
  orderNumber: string | null;
  createdAt: Date;
  orderStage: OrderStage;
  name: string;
  phone: string;
  email: string | null;
  locality: string;
  address: string;
  zip: string;
  products: string;
  total: string;
  awbCode: string | null;
}

// CheckoutPanel scrie mereu aceste linii în textul comenzii — le recuperăm de acolo în loc să
// recalculăm din prețurile curente ale produselor (care se pot schimba după plasarea comenzii).
function extractTotal(message: string | null): string {
  if (!message) return "";
  const withDelivery = message.match(/^Total cu livrare:\s*(.+)$/m);
  if (withDelivery) return withDelivery[1].trim();
  const subtotal = message.match(/^Subtotal:\s*(.+)$/m);
  return subtotal ? subtotal[1].trim() : "";
}

/** Comenzile din coș încă nepredate curierului (nici anulate) — cele pe care operatorii le
 * procesează activ și vor să le vadă centralizat în Excel. */
export async function listPendingOrders(): Promise<OrderExportRow[]> {
  const messages = await prisma.contactMessage.findMany({
    where: { source: "Comandă din coș", orderStage: { in: ["noua", "confirmata"] } },
    orderBy: { createdAt: "asc" },
  });

  const productIds = [...new Set(messages.flatMap((m) => m.productIds ?? []))];
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, name: true } })
    : [];
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return messages.map((m) => {
    const items = Array.isArray(m.orderItems) ? (m.orderItems as unknown as { productId: string; quantity: number }[]) : [];
    const productsText = items.length
      ? items.map((it) => `${nameById.get(it.productId) ?? "Produs șters"} x${it.quantity}`).join("; ")
      : "";
    return {
      id: m.id,
      orderNumber: m.orderNumber,
      createdAt: m.createdAt,
      orderStage: (m.orderStage as OrderStage) ?? "noua",
      name: m.name,
      phone: m.phone,
      email: m.email,
      locality: m.deliveryLocality ?? "",
      address: m.deliveryAddress ?? "",
      zip: m.deliveryZip ?? "",
      products: productsText,
      total: extractTotal(m.message),
      awbCode: m.awbCode,
    };
  });
}

const HEADERS = ["Nr. comandă", "Data", "Status", "Nume", "Telefon", "Email", "Localitate", "Adresă", "Cod poștal", "Produse", "Total", "AWB"];

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("ro-MD", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
}

function toTableRows(orders: OrderExportRow[]): string[][] {
  return orders.map((o) => [
    o.orderNumber ?? "",
    fmtDate(o.createdAt),
    orderStageLabel(o.orderStage),
    o.name,
    o.phone,
    o.email ?? "",
    o.locality,
    o.address,
    o.zip,
    o.products,
    o.total,
    o.awbCode ?? "",
  ]);
}

export function ordersToCSV(orders: OrderExportRow[]): string {
  const escape = (v: string) => (v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [HEADERS, ...toTableRows(orders)].map((row) => row.map(escape).join(","));
  // BOM ca Excel-ul deschis pe Windows să citească diacriticele corect, nu ca text corupt.
  return "﻿" + lines.join("\r\n");
}

export function ordersToXLSX(orders: OrderExportRow[]): Buffer {
  const rows = [HEADERS, ...toTableRows(orders)];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = HEADERS.map((h, i) => ({
    wch: Math.min(60, Math.max(h.length, ...rows.slice(1).map((r) => String(r[i] ?? "").length)) + 2),
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Comenzi");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export function ordersToPDF(orders: OrderExportRow[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 30 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(16).text("Comenzi nelivrate — Lamour", { align: "left" });
    doc.fontSize(9).fillColor("#666").text(`Generat: ${fmtDate(new Date())} · ${orders.length} comenzi`, { align: "left" });
    doc.moveDown(0.8);

    // Coloane simple, cu lățimi fixe — suficient pentru un tabel citibil, fără o librărie de tabele.
    const widths = [55, 70, 65, 80, 75, 100, 90, 130, 55, 150, 55, 70];
    const startX = doc.page.margins.left;
    let y = doc.y;

    const drawRow = (cells: string[], opts: { bold?: boolean; fillHeader?: boolean } = {}) => {
      const rowHeight = 16;
      if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
        doc.addPage();
        y = doc.page.margins.top;
      }
      if (opts.fillHeader) {
        doc.rect(startX, y - 2, widths.reduce((a, b) => a + b, 0), rowHeight).fill("#f3f4f6");
        doc.fillColor("#111");
      }
      doc.font(opts.bold ? "Helvetica-Bold" : "Helvetica").fontSize(7.5);
      let x = startX;
      cells.forEach((cell, i) => {
        doc.text(cell, x, y, { width: widths[i] - 4, height: rowHeight, ellipsis: true });
        x += widths[i];
      });
      y += rowHeight;
    };

    drawRow(HEADERS, { bold: true, fillHeader: true });
    for (const row of toTableRows(orders)) drawRow(row);

    doc.end();
  });
}

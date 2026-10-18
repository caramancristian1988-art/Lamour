// Regenerează lib/moldovaPostalCodes.ts: codul poștal al fiecărei localități EVS, din setul oficial „Coduri poștale RM”
// (dataset.gov.md, ultima actualizare 03.03.2020). Se păstrează DOAR localitățile cu un singur cod (fără omonime) și se exclude
// Chișinăul (are zeci de coduri, pe stradă) — codul lipsă se cere din fișierul comenzii.
//
//   node scripts/build-postal-codes.js
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const SOURCE_URL = "https://dataset.gov.md/resources/2015-11/coduri%20postale%20RM.xlsx";

const norm = (s) =>
  String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ")
    .replace(/\s*-\s*/g, "-")
    .trim();

async function main() {
  const root = path.join(__dirname, "..");
  const evsSource = fs.readFileSync(path.join(root, "lib", "moldovaLocalities.ts"), "utf8");
  const evs = [...evsSource.matchAll(/^\s*"((?:[^"\\]|\\.)*)",?\s*$/gm)].map((m) => JSON.parse(`"${m[1]}"`));
  if (evs.length < 1000) throw new Error("Lista de localități EVS nu a putut fi citită.");

  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Descărcarea setului oficial a eșuat (HTTP ${res.status}).`);
  const wb = XLSX.read(Buffer.from(await res.arrayBuffer()), { type: "buffer" });
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: "" });

  const byNorm = new Map();
  for (const r of rows) {
    const zip = String(r[1]).trim();
    if (!String(r[0]).trim() || !/^MD-\d{4}$/.test(zip)) continue;
    const k = norm(r[0]);
    if (!byNorm.has(k)) byNorm.set(k, new Set());
    byNorm.get(k).add(zip.replace("MD-", ""));
  }

  const out = {};
  for (const name of [...new Set(evs)].sort((a, b) => a.localeCompare(b, "ro"))) {
    if (norm(name) === "chisinau") continue;
    const zips = byNorm.get(norm(name));
    if (zips && zips.size === 1) out[name] = [...zips][0];
  }

  const body = [
    "// Cod poștal pe localitate (EVS), din setul oficial „Coduri poștale RM” (dataset.gov.md, actualizat 03.03.2020).",
    "// Doar localitățile cu UN SINGUR cod (fără omonime); Chișinăul lipsește intenționat (coduri pe stradă).",
    "// Regenerat cu scripts/build-postal-codes.js. Folosit doar când fișierul comenzii nu are cod poștal.",
    `export const POSTAL_CODE_BY_LOCALITY: Readonly<Record<string, string>> = ${JSON.stringify(out, null, 2)};`,
    "",
  ].join("\n");
  fs.writeFileSync(path.join(root, "lib", "moldovaPostalCodes.ts"), body);
  console.log(`✔ ${Object.keys(out).length} localități cu cod unic (din ${evs.length} EVS) → lib/moldovaPostalCodes.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

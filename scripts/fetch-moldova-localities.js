// Regenerează lib/moldovaLocalities.ts din lista oficială EVS Express
// (GetNomenclatures?type=localities) — de rulat din nou doar dacă EVS își
// actualizează nomenclatorul de localități.
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const username = process.env.EVS_USERNAME;
  const password = process.env.EVS_PASSWORD;
  const api = process.env.EVS_API_VERSION || "3.1";
  const baseUrl = process.env.EVS_API_URL || "https://api.muvi.dev/Shipments/Local/";

  const url = `${baseUrl}GetNomenclatures?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&type=localities&api=${api}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("Răspuns neașteptat de la EVS: " + JSON.stringify(data).slice(0, 300));
  }

  const names = [...new Set(data.map((d) => String(d.Name || "").trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );

  const header = [
    "// Lista oficială de localități din Republica Moldova, preluată din EVS Express",
    "// (GetNomenclatures?type=localities) — sursa de adevăr pentru ce recunoaște",
    "// curierul ca adresă de livrare validă. Regenerat cu scripts/fetch-moldova-localities.js.",
    `export const MOLDOVA_LOCALITIES: readonly string[] = ${JSON.stringify(names, null, 2)};`,
    "",
  ].join("\n");

  const outPath = path.join(__dirname, "..", "lib", "moldovaLocalities.ts");
  require("fs").writeFileSync(outPath, header);
  console.log(`✔ Scrise ${names.length} localități în lib/moldovaLocalities.ts`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

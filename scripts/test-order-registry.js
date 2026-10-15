// Teste de integrare pentru registrul de comenzi (lib/orderRegistry.ts), rulate pe baza de date din DATABASE_URL.
//
//   DATABASE_URL="mongodb+srv://..." node scripts/test-order-registry.js
//
// IZOLARE: comenzile de test au `source` = "TEST-REGISTRU-<random>", iar funcțiile registrului sunt apelate cu
// scope.source = același text — deci comenzile reale ale magazinului NU sunt citite, rezervate sau modificate.
// La final se șterg comenzile, exporturile și rândurile de audit create de test, iar contorul de exporturi revine
// la valoarea de dinainte (ca primul export real să nu pornească de la un număr „ars” de teste).
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const build = fs.mkdtempSync(path.join(os.tmpdir(), "registry-test-"));

// Compilăm doar modulele de care depinde registrul (TypeScript -> CommonJS) într-un folder temporar.
execFileSync(
  process.execPath,
  [
    path.join(root, "node_modules/typescript/bin/tsc"),
    path.join(root, "lib/orderRegistry.ts"),
    "--outDir", build,
    "--module", "commonjs",
    "--target", "es2020",
    "--moduleResolution", "node",
    "--esModuleInterop",
    "--skipLibCheck",
    "--resolveJsonModule",
  ],
  { stdio: "inherit" }
);

// Module.paths: @prisma/client se rezolvă din node_modules-ul proiectului.
module.paths.push(path.join(root, "node_modules"));
process.env.NODE_PATH = path.join(root, "node_modules");
require("module").Module._initPaths();

const { PrismaClient } = require(path.join(root, "node_modules/@prisma/client"));
const registry = require(path.join(build, "orderRegistry.js"));
const prisma = new PrismaClient();

const SOURCE = `TEST-REGISTRU-${Math.random().toString(36).slice(2, 8)}`;
const scope = { source: SOURCE };
const A = { channel: "site", id: "test-admin-A", name: "Test A" };
const B = { channel: "telegram", id: "test-user-B", name: "Test B" };

let passed = 0;
let failed = 0;
function check(name, condition, extra = "") {
  if (condition) {
    passed++;
    console.log(`  ✔ ${name}`);
  } else {
    failed++;
    console.log(`  ✘ ${name} ${extra}`);
  }
}

async function makeOrders(n, { withField }) {
  const ids = [];
  for (let i = 0; i < n; i++) {
    const row = await prisma.contactMessage.create({
      data: {
        name: `Client Test ${i + 1}`,
        phone: "060000000",
        source: SOURCE,
        message: "Test",
        orderStage: "noua",
        orderNumber: `T${i + 1}`,
        deliveryCodAmount: 100 + i,
        ...(withField ? { extractionStatus: "neextrasa" } : {}),
      },
    });
    ids.push(row.id);
  }
  return ids;
}

async function statusOf(ids) {
  const rows = await prisma.contactMessage.findMany({ where: { id: { in: ids } }, select: { id: true, extractionStatus: true, extractionExportId: true } });
  return rows;
}

async function run() {
  const counterBefore = await prisma.counter.findUnique({ where: { name: "orderExport" } });
  const createdExportIds = [];
  let orderIds = [];

  try {
    console.log(`\nSursă de test: ${SOURCE}`);

    console.log("\n1. O comandă nouă apare în registru (inclusiv fără câmpul extractionStatus)");
    // 6 cu câmpul setat, 4 FĂRĂ el (comenzi create de un cod mai vechi) — ambele trebuie tratate ca neextrase.
    orderIds = [...(await makeOrders(6, { withField: true })), ...(await makeOrders(4, { withField: false }))];
    const c0 = await registry.registryCounts(scope);
    check("10 comenzi în registru", c0.total === 10, JSON.stringify(c0));
    check("toate 10 sunt neextrase", c0.neextrase === 10, JSON.stringify(c0));

    console.log("\n2. Două persoane extrag simultan — nicio comandă în două exporturi");
    const [rA, rB] = await Promise.all([registry.prepareExport(A, scope), registry.prepareExport(B, scope)]);
    for (const r of [rA, rB]) if (r.export) createdExportIds.push(r.export.id);
    const ownedA = rA.export ? rA.export.orderCount : 0;
    const ownedB = rB.export ? rB.export.orderCount : 0;
    check("suma comenzilor rezervate = 10 (nimic pierdut)", ownedA + ownedB === 10, `A=${ownedA} B=${ownedB}`);
    const st = await statusOf(orderIds);
    check("fiecare comandă e rezervată exact o dată", st.every((o) => o.extractionStatus === "rezervata" && o.extractionExportId), JSON.stringify(st.map((o) => o.extractionStatus)));
    const exportsOfOrders = new Set(st.map((o) => o.extractionExportId));
    check("comenzile aparțin cel mult celor 2 exporturi", exportsOfOrders.size <= 2 && exportsOfOrders.size >= 1);
    const c1 = await registry.registryCounts(scope);
    check("niciuna nu mai e „neextrasă” după rezervare", c1.neextrase === 0 && c1.rezervate === 10, JSON.stringify(c1));

    // Alegem un export cu comenzi pentru testele următoare.
    const main = rA.export && rA.export.orderCount > 0 ? { actor: A, exp: rA.export } : { actor: B, exp: rB.export };

    console.log("\n3. Reluare: aceeași persoană nu creează un export duplicat");
    const resumed = await registry.prepareExport(main.actor, scope);
    check("a doua pornire reia exportul existent", resumed.kind === "resumed" && resumed.export.id === main.exp.id, JSON.stringify(resumed.kind));

    console.log("\n4. Confirmarea: comenzile devin extrase, dar rămân în registru");
    const conf = await registry.confirmExport(main.exp.id, main.actor);
    check("confirmare reușită", conf.kind === "confirmed" && conf.orderCount === main.exp.orderCount, JSON.stringify(conf));
    const conf2 = await registry.confirmExport(main.exp.id, main.actor);
    check("a doua confirmare e idempotentă (nu dublează)", conf2.kind === "confirmed" && conf2.alreadyConfirmed === true && conf2.orderCount === conf.orderCount);
    const c2 = await registry.registryCounts(scope);
    check("comenzile extrase rămân în registru (total neschimbat)", c2.total === 10, JSON.stringify(c2));
    check("numărul extraselor corespunde", c2.extrase === main.exp.orderCount, JSON.stringify(c2));
    const extractedList = await registry.listRegistry({ status: "extrasa", scope, pageSize: 50 });
    check("listarea „extrase” le arată", extractedList.total === main.exp.orderCount);
    const afterConfirmCancel = await registry.cancelExport(main.exp.id, main.actor);
    check("un export confirmat nu mai poate fi anulat", afterConfirmCancel.kind === "closed");

    console.log("\n5. Anulare: comenzile revin la neextrase, istoricul rămâne");
    // Trei comenzi noi, sosite după primul export — scenariu determinist (fără cursă).
    orderIds.push(...(await makeOrders(3, { withField: true })));
    const second = await registry.prepareExport(B, scope);
    check("al doilea export rezervă exact cele 3 comenzi noi", second.kind === "created" && second.export.orderCount === 3, JSON.stringify(second.kind));
    createdExportIds.push(second.export.id);
    const cancel = await registry.cancelExport(second.export.id, B);
    check("anulare reușită", cancel.kind === "cancelled" && cancel.released === 3, JSON.stringify(cancel));
    const c3 = await registry.registryCounts(scope);
    check("comenzile anulate sunt din nou neextrase", c3.neextrase === 3, JSON.stringify(c3));
    const hist = await registry.getExportSummary(second.export.id);
    check("exportul anulat rămâne în istoric", hist && hist.status === "anulat");
    const confAfterCancel = await registry.confirmExport(second.export.id, B);
    check("un export anulat nu mai poate fi confirmat", confAfterCancel.kind === "closed");

    console.log("\n6. Expirare: o rezervare neconfirmată se eliberează singură");
    const prep = await registry.prepareExport(B, scope);
    check("se pregătește un export nou din cele 3 comenzi", prep.kind === "created" && prep.export.orderCount === 3, JSON.stringify(prep.kind));
    createdExportIds.push(prep.export.id);
    await prisma.orderExport.update({ where: { id: prep.export.id }, data: { reservedUntil: new Date(Date.now() - 1000) } });
    const released = await registry.expireStaleExports();
    const after = await registry.getExportSummary(prep.export.id);
    check("rezervarea expirată a eliberat comenzile", released >= 3, "released=" + released);
    check("exportul are statusul „expirat”", after && after.status === "expirat");
    const c4 = await registry.registryCounts(scope);
    check("comenzile sunt iar neextrase", c4.neextrase === 3, JSON.stringify(c4));

    console.log("\n7. „Nu există comenzi noi”");
    const last = await registry.prepareExport(A, scope);
    check("ultimele 3 comenzi se pot extrage după expirare", last.kind === "created" && last.export.orderCount === 3, JSON.stringify(last.kind));
    createdExportIds.push(last.export.id);
    const lastConf = await registry.confirmExport(last.export.id, A);
    check("confirmarea ultimului export reușește", lastConf.kind === "confirmed" && lastConf.orderCount === 3);
    const none = await registry.prepareExport(B, scope);
    check("fără comenzi neextrase, exportul nu se creează", none.kind === "none", JSON.stringify(none.kind));
    const c5 = await registry.registryCounts(scope);
    check("toate cele 13 comenzi sunt extrase și încă în registru", c5.extrase === 13 && c5.total === 13 && c5.neextrase === 0, JSON.stringify(c5));
    check("nicio comandă nu e în două exporturi confirmate", (await prisma.contactMessage.count({ where: { source: SOURCE, extractionStatus: "extrasa" } })) === 13);


    console.log("\n8. Arhivare: ascunde din lista implicită, dar comanda rămâne în registru");
    const okArchive = await registry.setOrderArchived(orderIds[0], true, A, scope);
    const defaultList = await registry.listRegistry({ status: "toate", scope, pageSize: 50 });
    const fullList = await registry.listRegistry({ status: "toate", scope, includeArchived: true, pageSize: 50 });
    check("arhivarea reușește", okArchive === true);
    check("lista implicită nu o mai arată", defaultList.total === 12, `total=${defaultList.total}`);
    check("lista cu arhivate o arată", fullList.total === 13, `total=${fullList.total}`);
    check("totalul registrului rămâne 13", (await registry.registryCounts(scope)).total === 13);

    console.log("\n9. Căutare după număr și detalii");
    const found = await registry.findRegistryOrder("T3", scope);
    check("comanda T3 se găsește după număr", found && found.orderNumber === "T3" && found.total === 102, JSON.stringify(found && found.total));
    check("o comandă inexistentă nu se găsește", (await registry.findRegistryOrder("NU-EXISTA", scope)) === null);

    console.log("\n10. Jurnal de audit");
    const audit = await prisma.exportAuditLog.findMany({ where: { exportId: { in: createdExportIds } } });
    const actions = new Set(audit.map((a) => a.action));
    check("există intrări de audit pentru pregătire", actions.has("export_pregatit"));
    check("există intrări de audit pentru confirmare", actions.has("export_confirmat"));
    check("există intrări de audit pentru reluare", actions.has("export_reluat"));
  } finally {
    // Curățenie: nimic din test nu rămâne în baza reală.
    await prisma.contactMessage.deleteMany({ where: { source: SOURCE } });
    if (createdExportIds.length) {
      await prisma.exportAuditLog.deleteMany({ where: { exportId: { in: createdExportIds } } });
      await prisma.orderExport.deleteMany({ where: { id: { in: createdExportIds } } });
    }
    // Exporturi create de test dar rămase în afara listei (ex. cele două din cursa de la pasul 2).
    await prisma.orderExport.deleteMany({ where: { initiatedById: { in: [A.id, B.id] } } });
    await prisma.exportAuditLog.deleteMany({ where: { actorId: { in: [A.id, B.id] } } });
    if (counterBefore) await prisma.counter.update({ where: { name: "orderExport" }, data: { value: counterBefore.value } });
    else await prisma.counter.deleteMany({ where: { name: "orderExport" } });
    fs.rmSync(build, { recursive: true, force: true });
    await prisma.$disconnect();
  }

  console.log(`\nRezultat: ${passed} reușite, ${failed} eșuate.`);
  process.exit(failed === 0 ? 0 : 1);
}

run().catch(async (err) => {
  console.error("Testul a căzut:", err);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(2);
});

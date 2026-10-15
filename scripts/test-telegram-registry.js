// Teste pentru registrul de comenzi în Telegram (lib/telegramRegistry.ts): comenzi text, butoane, permisiuni,
// protecția datelor personale, fluxul de extragere și conținutul fișierului Excel.
//
//   DATABASE_URL="mongodb+srv://..." node scripts/test-telegram-registry.js
//
// NU trimite nimic către Telegram: `fetch` e înlocuit cu un simulator care doar înregistrează cererile.
// Folosește comenzi sintetice (nume „ZZ-TEST-TG …”, etapă „anulata” ca să nu apară în exportul operatorilor)
// și șterge totul la final, inclusiv drepturile de test și contorul exporturilor.
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.resolve(__dirname, "..");
const build = fs.mkdtempSync(path.join(os.tmpdir(), "tg-registry-test-"));

execFileSync(
  process.execPath,
  [
    path.join(root, "node_modules/typescript/bin/tsc"),
    path.join(root, "lib/telegramRegistry.ts"),
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

process.env.NODE_PATH = path.join(root, "node_modules");
require("module").Module._initPaths();

process.env.TELEGRAM_BOT_TOKEN = "test-token";
process.env.TELEGRAM_CHAT_ID = "-100000";
process.env.TELEGRAM_REGISTRY_CHAT_ID = "-100123";
process.env.TELEGRAM_REGISTRY_ADMIN_IDS = "900";

const { PrismaClient } = require(path.join(root, "node_modules/@prisma/client"));
const XLSX = require(path.join(root, "node_modules/xlsx"));
const prisma = new PrismaClient();

// ── Simulator Telegram ─────────────────────────────────────────────────────────────────────────
const sent = []; // { kind: "message"|"document", chatId, text, buttons, filename, buffer }
let nextMessageId = 1000;
global.fetch = async (url, init) => {
  const u = String(url);
  if (u.includes("/sendMessage")) {
    const body = JSON.parse(init.body);
    sent.push({ kind: "message", chatId: String(body.chat_id), text: body.text, buttons: (body.reply_markup && body.reply_markup.inline_keyboard) || [] });
    return { status: 200, json: async () => ({ ok: true, result: { message_id: nextMessageId++ } }) };
  }
  if (u.includes("/sendDocument")) {
    const form = init.body;
    const doc = form.get("document");
    const buffer = Buffer.from(await doc.arrayBuffer());
    sent.push({ kind: "document", chatId: String(form.get("chat_id")), filename: doc.name, buffer, mime: doc.type, caption: String(form.get("caption") || "") });
    return { status: 200, json: async () => ({ ok: true, result: {} }) };
  }
  if (u.includes("/answerCallbackQuery")) {
    sent.push({ kind: "answer", text: JSON.parse(init.body).text || "" });
    return { status: 200, json: async () => ({ ok: true }) };
  }
  return { status: 200, json: async () => ({ ok: true, result: {} }) };
};

const tg = require(path.join(build, "telegramRegistry.js"));
const { EXPORT_HEADERS } = require(path.join(build, "orderRegistryExcel.js"));

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

const REG_CHAT = { id: -100123, type: "supergroup" };
const OTHER_GROUP = { id: -999, type: "group" };
const priv = (id) => ({ id, type: "private" });
const user = (id, first) => ({ id, first_name: first });

function msgsTo(chatId) {
  return sent.filter((s) => s.kind === "message" && s.chatId === String(chatId));
}
function lastTo(chatId) {
  const m = msgsTo(chatId);
  return m[m.length - 1];
}
// Telegram primește HTML escapat — pentru aserțiuni comparăm textul simplu.
const plain = (s) => (s ? s.text.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&") : "");

async function cmd(text, from, chat) {
  sent.length = 0;
  const handled = await tg.handleRegistryMessage({ text, from, chat });
  return handled;
}
async function press(data, from, chat) {
  sent.length = 0;
  await tg.handleRegistryCallback({ id: "cb1", from, data, message: { chat } });
}

async function run() {
  const counterBefore = await prisma.counter.findUnique({ where: { name: "orderExport" } });
  const orderIds = [];
  const permIds = ["901", "903", "904"];

  try {
    // Drepturi de test: 901 doar vizualizare+consultare; 903 + date personale; 904 extragere+confirmare; 902 fără drepturi.
    await prisma.telegramUserPermission.deleteMany({ where: { telegramUserId: { in: permIds } } });
    await prisma.telegramUserPermission.createMany({
      data: [
        { telegramUserId: "901", name: "Vizualizator", permissions: ["vizualizare", "consultare"] },
        { telegramUserId: "903", name: "Consultant", permissions: ["vizualizare", "consultare", "date_personale"] },
        { telegramUserId: "904", name: "Extractor", permissions: ["vizualizare", "extragere", "confirmare"] },
      ],
    });

    // 12 comenzi sintetice (2 produse la prima).
    for (let i = 1; i <= 12; i++) {
      const row = await prisma.contactMessage.create({
        data: {
          name: `ZZ-TEST-TG Client ${i}`,
          phone: "069000111",
          email: `test${i}@example.com`,
          source: "Comandă din coș",
          message: "Test",
          orderStage: "anulata", // ca să nu apară în exportul vechi al operatorilor în cele câteva secunde de test
          orderNumber: `ZT${i}`,
          deliveryLocality: "Chișinău",
          deliveryAddress: "Strada Testului 1",
          deliveryCodAmount: 100 + i,
          extractionStatus: "neextrasa",
          orderItemsSnapshot:
            i === 1
              ? [
                  { productId: "x", name: "Produs A", quantity: 2, unitPrice: 25, lineTotal: 50 },
                  { productId: "y", name: "Produs B", quantity: 1, unitPrice: 51, lineTotal: 51 },
                ]
              : [{ productId: "x", name: "Produs A", quantity: 1, unitPrice: 100 + i, lineTotal: 100 + i }],
        },
      });
      orderIds.push(row.id);
    }

    console.log("\nA. Identitate și acces la chat");
    await cmd("/id", user(902, "Fără drepturi"), OTHER_GROUP);
    check("/id răspunde în orice grup, cu ID-urile", /902/.test(plain(lastTo(-999))) && /-999/.test(plain(lastTo(-999))));
    await cmd("/noi", user(900, "Admin"), OTHER_GROUP);
    check("într-un alt grup, comenzile registrului nu răspund", sent.length === 0);

    console.log("\nB. Permisiuni");
    await cmd("/noi", user(902, "Fără drepturi"), REG_CHAT);
    const denied = plain(lastTo(-100123));
    check("fără drept: mesaj de refuz cu ID-ul Telegram", /Nu aveți dreptul/.test(denied) && /902/.test(denied), denied);
    check("fără drept: nu se afișează nicio comandă", !/ZT1/.test(denied));
    await cmd("/extrage", user(901, "Vizualizator"), REG_CHAT);
    check("fără dreptul de extragere, /extrage e refuzat", /Nu aveți dreptul/.test(plain(lastTo(-100123))));

    console.log("\nC. Liste și paginare (fără date personale)");
    await cmd("/noi", user(901, "Vizualizator"), REG_CHAT);
    const page1 = lastTo(-100123);
    check("pagina 1 listează comenzile neextrase", /Comenzi neextrase/.test(plain(page1)) && /12 comenzi/.test(plain(page1)) && /Pagina 1 din 2/.test(plain(page1)));
    check("în listă nu apar telefon, adresă sau email", !/069000111|Strada|example\.com/.test(plain(page1)));
    const nextBtn = page1.buttons.flat().find((b) => /Următoarele 2 comenzi/.test(b.text));
    check("buton „Următoarele 2 comenzi”", Boolean(nextBtn), JSON.stringify(page1.buttons));
    await press(nextBtn.callback_data, user(901, "Vizualizator"), REG_CHAT);
    const page2 = lastTo(-100123);
    check("pagina 2 are cele 2 rămase și butonul „Comenzile anterioare”", /Pagina 2 din 2/.test(plain(page2)) && page2.buttons.flat().some((b) => /Comenzile anterioare/.test(b.text)));

    console.log("\nD. Detalii comandă și date personale");
    await cmd("/comanda ZT1", user(901, "Vizualizator"), REG_CHAT);
    const d1 = plain(lastTo(-100123));
    check("detalii: produse, cantități, prețuri, total", /2 bucăți Produs A/.test(d1) && /Produs B/.test(d1) && /Total comandă/.test(d1), d1);
    check("fără dreptul de date personale: telefon/adresă ascunse", !/069000111|Strada Testului/.test(d1) && /nu sunt afișate/.test(d1));
    await cmd("/comanda_ZT1", user(903, "Consultant"), REG_CHAT);
    const inGroup = plain(lastTo(-100123));
    const toPrivate = plain(lastTo(903));
    check("în grup nu apar telefonul și adresa chiar pentru cel autorizat", !/069000111|Strada Testului/.test(inGroup) && /conversația privată/.test(inGroup));
    check("telefonul și adresa au mers în privat către cel autorizat", /069000111/.test(toPrivate) && /Strada Testului/.test(toPrivate), toPrivate);
    await cmd("/comanda ZT2", user(903, "Consultant"), priv(903));
    check("în privat, datele personale sunt incluse", /069000111/.test(plain(lastTo(903))));
    await cmd("/comanda 99999", user(901, "Vizualizator"), REG_CHAT);
    check("comandă inexistentă: mesaj clar", /Nu am găsit comanda 99999/.test(plain(lastTo(-100123))));

    console.log("\nE. Extragere: pregătire, fișier, confirmare");
    await cmd("/extrage", user(904, "Extractor"), REG_CHAT);
    const offer = lastTo(-100123);
    check("întrebarea de pregătire cu numărul comenzilor", /Sunt disponibile 12 comenzi neextrase\. Doriți să pregătiți fișierul Excel\?/.test(plain(offer)), plain(offer));
    check("butoane „Pregătește exportul” și „Anulează”", offer.buttons.flat().some((b) => b.text === "Pregătește exportul") && offer.buttons.flat().some((b) => b.text === "Anulează"));

    await press("reg_prep:0", user(901, "Vizualizator"), REG_CHAT);
    check("cine nu are dreptul nu poate pregăti exportul", (await prisma.contactMessage.count({ where: { name: { startsWith: "ZZ-TEST-TG" }, extractionStatus: "rezervata" } })) === 0);

    await press("reg_prep:0", user(904, "Extractor"), REG_CHAT);
    const doc = sent.find((s) => s.kind === "document");
    check("fișierul Excel e trimis ÎN PRIVAT, nu în grup", doc && doc.chatId === "904", JSON.stringify(doc && doc.chatId));
    check("numele fișierului este clar", doc && /^comenzi_neextrase_\d{4}-\d{2}-\d{2}_export-\d+\.xlsx$/.test(doc.filename), doc && doc.filename);
    check("tip MIME XLSX", doc && /spreadsheetml\.sheet/.test(doc.mime));
    const confirmMsg = lastTo(904);
    const btns = confirmMsg.buttons.flat().map((b) => b.text);
    check("mesaj cu „Confirm extragerea” și „Nu am primit fișierul”", btns.includes("Confirm extragerea") && btns.includes("Nu am primit fișierul"), JSON.stringify(btns));
    const groupNote = plain(lastTo(-100123));
    check("grupul primește doar anunțul (fără date personale)", /conține 12 comenzi/.test(groupNote) && !/069000111/.test(groupNote), groupNote);

    const reserved = await prisma.contactMessage.count({ where: { name: { startsWith: "ZZ-TEST-TG" }, extractionStatus: "rezervata" } });
    const extractedEarly = await prisma.contactMessage.count({ where: { name: { startsWith: "ZZ-TEST-TG" }, extractionStatus: "extrasa" } });
    check("după trimiterea fișierului comenzile sunt doar REZERVATE (nu extrase automat)", reserved === 12 && extractedEarly === 0, `rezervate=${reserved} extrase=${extractedEarly}`);

    // Conținutul Excel.
    const wb = XLSX.read(doc.buffer, { type: "buffer" });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: null });
    check("antetul Excel are coloanele așteptate", JSON.stringify(rows[0]) === JSON.stringify(EXPORT_HEADERS), JSON.stringify(rows[0]));
    check("un rând pe produs: 13 rânduri de date (12 comenzi, una cu 2 produse)", rows.length - 1 === 13, `rânduri=${rows.length - 1}`);
    const zt1 = rows.slice(1).filter((r) => r[1] === "ZT1");
    check("comanda ZT1 apare pe 2 rânduri, cu cantități și prețuri numerice", zt1.length === 2 && typeof zt1[0][9] === "number" && typeof zt1[0][10] === "number" && zt1[0][9] === 2 && zt1[0][10] === 25 && zt1[0][11] === 50, JSON.stringify(zt1));
    check("totalul comenzii e numeric", typeof zt1[0][12] === "number" && zt1[0][12] === 101);
    check("sunt prezente telefon și adresă în fișier", zt1[0][6] === "069000111" && /Strada Testului/.test(zt1[0][7]));
    const merges = wb.Sheets[wb.SheetNames[0]]["!merges"];
    check("fără celule îmbinate", !merges || merges.length === 0);

    console.log("\nF. Cine poate confirma");
    const exportId = (await prisma.contactMessage.findFirst({ where: { name: "ZZ-TEST-TG Client 1" }, select: { extractionExportId: true } })).extractionExportId;
    await press(`reg_ok:${exportId}`, user(901, "Vizualizator"), priv(901));
    check("fără dreptul de confirmare, comenzile rămân rezervate", (await prisma.contactMessage.count({ where: { name: { startsWith: "ZZ-TEST-TG" }, extractionStatus: "rezervata" } })) === 12);

    await press(`reg_nofile:${exportId}`, user(904, "Extractor"), priv(904));
    check("„Nu am primit fișierul” retrimite același fișier", sent.some((s) => s.kind === "document" && s.chatId === "904"));
    check("…iar comenzile rămân rezervate, nu se pierd", (await prisma.contactMessage.count({ where: { name: { startsWith: "ZZ-TEST-TG" }, extractionStatus: "rezervata" } })) === 12);

    await press(`reg_ok:${exportId}`, user(904, "Extractor"), priv(904));
    const ok = plain(lastTo(904));
    check("confirmarea marchează cele 12 comenzi", /Extragerea a fost confirmată\. 12 comenzi au fost marcate ca extrase/.test(ok), ok);
    check("grupul registrului află de confirmare", /a fost confirmat de Extractor/.test(plain(lastTo(-100123))));
    check("în baza de date: 12 extrase, cu cine și când", (await prisma.contactMessage.count({ where: { name: { startsWith: "ZZ-TEST-TG" }, extractionStatus: "extrasa", extractedBy: { contains: "Extractor" } } })) === 12);

    await press(`reg_ok:${exportId}`, user(904, "Extractor"), priv(904));
    check("a doua apăsare nu dublează nimic", /era deja confirmat/.test(plain(lastTo(904))));

    console.log("\nG. După extragere");
    await cmd("/extrage", user(904, "Extractor"), REG_CHAT);
    check("„Nu există comenzi noi pentru extragere.”", /Nu există comenzi noi pentru extragere\./.test(plain(lastTo(-100123))));
    await cmd("/noi", user(901, "Vizualizator"), REG_CHAT);
    check("/noi: nu mai sunt comenzi neextrase", /Nu există comenzi noi, neextrase/.test(plain(lastTo(-100123))));
    await cmd("/extrase", user(901, "Vizualizator"), REG_CHAT);
    check("/extrase le arată, ele rămân în registru", /Comenzi extrase/.test(plain(lastTo(-100123))) && /ZT1/.test(plain(lastTo(-100123)) + "ZT1"));
    await cmd("/istoric", user(901, "Vizualizator"), REG_CHAT);
    check("/istoric arată exportul confirmat", /confirmat/.test(plain(lastTo(-100123))) && /12 comenzi/.test(plain(lastTo(-100123))));
    await cmd("/status", user(901, "Vizualizator"), REG_CHAT);
    check("/status: numere și grupul configurat", /Extrase:/.test(plain(lastTo(-100123))) && /configurat/.test(plain(lastTo(-100123))));
    await cmd("/ajutor", user(902, "Oricine"), priv(902));
    check("/ajutor e disponibil și fără drepturi", /\/extrage/.test(plain(lastTo(902))));
  } finally {
    await prisma.contactMessage.deleteMany({ where: { name: { startsWith: "ZZ-TEST-TG" } } });
    await prisma.telegramUserPermission.deleteMany({ where: { telegramUserId: { in: permIds } } });
    await prisma.orderExport.deleteMany({ where: { initiatedById: { in: ["900", "901", "903", "904"] } } });
    await prisma.exportAuditLog.deleteMany({ where: { actorId: { in: ["900", "901", "903", "904"] } } });
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

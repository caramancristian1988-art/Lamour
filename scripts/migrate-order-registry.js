// Migrare unică pentru registrul de comenzi: comenzile din coș create ÎNAINTE de registru primesc statusul
// „extrasă” (au fost deja procesate), ca primul export real să conțină doar comenzile noi.
// Idempotent: atinge doar comenzile fără extractionStatus; rulat a doua oară nu schimbă nimic.
//
//   DATABASE_URL="..." node scripts/migrate-order-registry.js            # doar raportează
//   DATABASE_URL="..." node scripts/migrate-order-registry.js --apply    # aplică
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const apply = process.argv.includes("--apply");
const CART_SOURCE = "Comandă din coș";

(async () => {
  const where = { source: CART_SOURCE, OR: [{ extractionStatus: { isSet: false } }, { extractionStatus: null }] };
  const pending = await prisma.contactMessage.count({ where });
  const total = await prisma.contactMessage.count({ where: { source: CART_SOURCE } });
  console.log(`${apply ? "APPLY" : "DRY-RUN"}: ${total} comenzi din coș în total, ${pending} fără status de extragere.`);
  if (apply && pending > 0) {
    const r = await prisma.contactMessage.updateMany({
      where,
      data: { extractionStatus: "extrasa", extractedAt: new Date(), extractedBy: "Migrare inițială (comenzi dinainte de registru)" },
    });
    console.log(`✔ ${r.count} comenzi marcate „extrase”.`);
  }
  const after = await prisma.contactMessage.count({ where: { source: CART_SOURCE, extractionStatus: "extrasa" } });
  const fresh = await prisma.contactMessage.count({ where: { source: CART_SOURCE, OR: [{ extractionStatus: { isSet: false } }, { extractionStatus: "neextrasa" }] } });
  console.log(`Acum: ${after} extrase, ${fresh} neextrase.`);
  await prisma.$disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { badge: { startsWith: "Reducere -" } },
  });
  for (const p of products) {
    const newBadge = p.badge.replace(/^Reducere\s*/, "");
    await prisma.product.update({ where: { id: p.id }, data: { badge: newBadge } });
    console.log(`"${p.badge}" -> "${newBadge}" (${p.slug})`);
  }
  console.log(`${products.length} produse actualizate`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

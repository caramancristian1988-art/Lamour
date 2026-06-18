const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const renames = {
  "Eficiență A++": "A++",
  "Eficiență A+": "A+",
  "Ofertă specială": "Special",
};

async function main() {
  for (const [oldBadge, newBadge] of Object.entries(renames)) {
    const result = await prisma.product.updateMany({
      where: { badge: oldBadge },
      data: { badge: newBadge },
    });
    console.log(`"${oldBadge}" -> "${newBadge}": ${result.count} produse actualizate`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

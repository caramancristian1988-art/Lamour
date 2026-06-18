const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const brands = [
  "Mitsubishi Electric",
  "Cooper&Hunter",
  "Daikin",
  "Gree",
  "Midea",
  "Electrolux",
  "LG",
  "Samsung",
  "Haier",
  "Panasonic",
  "Fujitsu",
  "Hitachi",
  "Carrier",
  "Trane",
  "Bosch",
  "Toshiba",
  "Ariston",
  "Hisense",
  "Whirlpool",
  "Sharp",
];

async function main() {
  const products = await prisma.product.findMany();
  let updated = 0;

  for (const product of products) {
    const brand = brands.find((b) => product.name.toLowerCase().includes(b.toLowerCase()));
    if (brand && product.brand !== brand) {
      await prisma.product.update({ where: { id: product.id }, data: { brand } });
      updated++;
    }
  }

  console.log(`✔ Setat brand pentru ${updated} produse.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

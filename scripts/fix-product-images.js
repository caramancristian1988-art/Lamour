const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const residentialPhotos = [
  "/510px_klimatyzator-split-Daikin-SENSIRA-FTXFE-01.webp",
  "/CH-S24FTXN-NG_00-800x800_thm.jpg",
  "/gree-pular.webp",
  "/klimatyzator-scienny-mitsubishi-electric-hr-msz-hr50vf-5kw_9cb0a676-7d03-4a32-ba2a-4b320f3a2a44.webp",
  "/mitsubishi.webp",
  "/res_03c40fb7f1018a235a69d0b3c08658e6.webp",
];

const commercialPhoto = "/Aparat-aer-conditionat-tavan-Daikin-Climatizare-sibiu-600x600.webp";
const multisplitPhotos = ["/multisplit.webp", "/MIDEA@FT_Multi-split_Free_Match_product_02.webp"];
const portablePhoto = "/portabile.webp";
const accessoryPhoto = "/9e0723f0-6ade-49f6-abca-8102bebbfec0.png";

async function main() {
  const products = await prisma.product.findMany({
    where: { image: { startsWith: "https://placehold.co" } },
    include: { category: true },
    orderBy: { name: "asc" },
  });

  let residentialIndex = 0;
  let multisplitIndex = 0;
  let updated = 0;

  for (const p of products) {
    let image;
    switch (p.category.slug) {
      case "conditioane-comerciale":
        image = commercialPhoto;
        break;
      case "sisteme-multisplit":
        image = multisplitPhotos[multisplitIndex % multisplitPhotos.length];
        multisplitIndex++;
        break;
      case "conditioane-portabile":
        image = portablePhoto;
        break;
      case "accesorii-consumabile":
        image = accessoryPhoto;
        break;
      default:
        image = residentialPhotos[residentialIndex % residentialPhotos.length];
        residentialIndex++;
    }

    await prisma.product.update({ where: { id: p.id }, data: { image } });
    updated++;
  }

  console.log(`✔ Actualizate ${updated} produse cu poze reale.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const images = {
  "Instalare condiționere": "/IMG_2963.PNG",
  "Mentenanță & curățare": "/IMG_2968.PNG",
  "Reparații": "/IMG_2964.PNG",
  "Consultanță": "/IMG_2965.PNG",
  "Sisteme multisplit": "/IMG_2966.PNG",
  "Sisteme comerciale HVAC": "/IMG_2967.PNG",
};

async function main() {
  for (const [title, image] of Object.entries(images)) {
    const result = await prisma.service.updateMany({
      where: { title },
      data: { image },
    });
    console.log(`"${title}" -> ${image}: ${result.count} servicii actualizate`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

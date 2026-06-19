const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// image: thumbnail shown on the /servicii listing cards (restored to originals)
// detailImage: photo shown in the "Despre serviciu" section on the service's own page
const data = {
  "Instalare condiționere": { image: "/IMG_2838.PNG", detailImage: "/IMG_2963.PNG" },
  "Mentenanță & curățare": { image: "/IMG_2839.PNG", detailImage: "/IMG_2968.PNG" },
  "Reparații": { image: "/IMG_2840.PNG", detailImage: "/IMG_2964.PNG" },
  "Consultanță": { image: "/IMG_2841.PNG", detailImage: "/IMG_2965.PNG" },
  "Sisteme multisplit": { image: "/IMG_2843.PNG", detailImage: "/IMG_2966.PNG" },
  "Sisteme comerciale HVAC": { image: "/IMG_2842.PNG", detailImage: "/IMG_2967.PNG" },
};

async function main() {
  for (const [title, fields] of Object.entries(data)) {
    const result = await prisma.service.updateMany({
      where: { title },
      data: fields,
    });
    console.log(`"${title}" -> image: ${fields.image}, detailImage: ${fields.detailImage}: ${result.count} servicii actualizate`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

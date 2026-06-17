const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const services = [
  { title: "Instalare condiționere", description: "Montaj rapid și sigur pentru apartamente, case, birouri și spații comerciale.", image: "/IMG_2838.PNG", href: "/servicii/instalare", section: "principale", order: 0 },
  { title: "Mentenanță & curățare", description: "Curățare profesională, igienizare, încărcare freon și verificări complete.", image: "/IMG_2839.PNG", href: "/servicii/mentenanta", section: "principale", order: 1 },
  { title: "Reparații", description: "Diagnosticare rapidă și reparații pentru orice tip de problemă.", image: "/IMG_2840.PNG", href: "/servicii/diagnosticare", section: "principale", order: 2 },
  { title: "Consultanță", description: "Te ajutăm să alegi sistemul potrivit pentru nevoile și bugetul tău.", image: "/IMG_2841.PNG", href: "/servicii/consultanta", section: "avansate", order: 0 },
  { title: "Sisteme multisplit", description: "Climatizare pentru mai multe camere cu o singură unitate exterioară.", image: "/IMG_2843.PNG", href: "/servicii/multisplit", section: "avansate", order: 1 },
  { title: "Sisteme comerciale HVAC", description: "Soluții profesionale pentru spații comerciale, birouri, hale și clădiri mari.", image: "/IMG_2842.PNG", href: "/servicii/comerciale", section: "avansate", order: 2 },
  { title: "Demontare & relocare", description: "Demontare aparat, mutare și reinstalare profesională.", image: null, href: null, section: "suplimentare", order: 0 },
  { title: "Verificări tehnice", description: "Verificare consum, test eficiență și detectare pierderi de freon.", image: null, href: null, section: "suplimentare", order: 1 },
  { title: "Abonamente service", description: "Întreținere periodică, vizite sezoniere și prioritate suport.", image: null, href: null, section: "suplimentare", order: 2 },
];

async function main() {
  const count = await prisma.service.count();
  if (count > 0) {
    console.log(`Tabelul Service are deja ${count} înregistrări — nu adaug nimic.`);
    return;
  }

  await prisma.service.createMany({ data: services });
  console.log(`✔ Am adăugat ${services.length} servicii.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

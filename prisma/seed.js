const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.blogPost.deleteMany();

  const residential = await prisma.category.create({
    data: {
      name: "Condiționere rezidențiale",
      slug: "conditioane-rezidentiale",
      description: "Condiționere pentru uz casnic, eficiente și silențioase",
      image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Rezidentiale",
    },
  });

  const commercial = await prisma.category.create({
    data: {
      name: "Condiționere comerciale",
      slug: "conditioane-comerciale",
      description: "Soluții de climatizare pentru spații comerciale",
      image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Comerciale",
    },
  });

  const multisplit = await prisma.category.create({
    data: {
      name: "Sisteme multisplit",
      slug: "sisteme-multisplit",
      description: "Un singur exterior, mai multe camere climatizate",
      image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Multisplit",
    },
  });

  const portable = await prisma.category.create({
    data: {
      name: "Condiționere portabile",
      slug: "conditioane-portabile",
      description: "Flexibilitate maximă, instalare simplă",
      image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Portabile",
    },
  });

  await prisma.category.create({
    data: {
      name: "Accesorii și consumabile",
      slug: "accesorii-consumabile",
      description: "Filtre, telecomande, suporturi și alte accesorii",
      image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Accesorii",
    },
  });

  await prisma.product.create({
    data: {
      name: "Daikin Sensira FTXF35E",
      slug: "daikin-sensira-ftxf35e",
      description:
        "Condiționer inverter eficient și silențios, ideal pentru dormitor sau living.",
      price: 12999,
      oldPrice: 14500,
      image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Daikin+Sensira",
      btu: 12000,
      inverter: true,
      energyClass: "A++",
      rating: 4.8,
      reviewCount: 24,
      badge: "A++",
      categoryId: residential.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Gree Pular GWH12AGC",
      slug: "gree-pular-gwh12agc",
      description:
        "Condiționer cu design elegant și consum redus de energie.",
      price: 10499,
      oldPrice: 11999,
      image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Gree+Pular",
      btu: 12000,
      inverter: true,
      energyClass: "A++",
      rating: 4.7,
      reviewCount: 18,
      badge: "-10%",
      categoryId: residential.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Midea All Easy MSAGBU-12HRFN8",
      slug: "midea-all-easy",
      description: "Ușor de instalat și operat, perfect pentru spații medii.",
      price: 9999,
      image:
        "https://placehold.co/400x400/f0f7ff/1d2353?text=Midea+All+Easy",
      btu: 12000,
      inverter: true,
      energyClass: "A++",
      rating: 4.6,
      reviewCount: 15,
      categoryId: residential.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Electrolux EXP26U338CW",
      slug: "electrolux-exp26u338cw",
      description: "Condiționer portabil cu 3 viteze de ventilare și timer.",
      price: 8499,
      image:
        "https://placehold.co/400x400/f0f7ff/1d2353?text=Electrolux+Portabil",
      btu: 9000,
      inverter: false,
      energyClass: "A",
      rating: 4.5,
      reviewCount: 11,
      categoryId: portable.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Mitsubishi Electric MSZ-HR35VF",
      slug: "mitsubishi-electric-msz-hr35vf",
      description:
        "Performanță superioară și fiabilitate dovedită de la Mitsubishi Electric.",
      price: 13999,
      image:
        "https://placehold.co/400x400/f0f7ff/1d2353?text=Mitsubishi+Electric",
      btu: 12000,
      inverter: true,
      energyClass: "A++",
      rating: 4.9,
      reviewCount: 31,
      categoryId: residential.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Cooper&Hunter Nordic CH-S12FTXN",
      slug: "cooper-hunter-nordic",
      description:
        "Funcționează eficient până la -30°C, ideal pentru clima moldovenească.",
      price: 11299,
      image:
        "https://placehold.co/400x400/f0f7ff/1d2353?text=Cooper+Hunter",
      btu: 12000,
      inverter: true,
      energyClass: "A++",
      rating: 4.7,
      reviewCount: 22,
      categoryId: residential.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Sistem multisplit Midea 2 camere",
      slug: "midea-multisplit-2-camere",
      description:
        "Soluție completă pentru 2 camere cu o singură unitate exterioară.",
      price: 21999,
      image:
        "https://placehold.co/400x400/f0f7ff/1d2353?text=Multisplit+Midea",
      btu: 18000,
      inverter: true,
      energyClass: "A++",
      rating: 4.8,
      reviewCount: 9,
      categoryId: multisplit.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Casetă tavan Daikin FCAG35A",
      slug: "daikin-fcag35a-caseta",
      description:
        "Distribuție uniformă a aerului în patru direcții, ideal pentru birouri.",
      price: 24999,
      image:
        "https://placehold.co/400x400/f0f7ff/1d2353?text=Daikin+Caseta",
      btu: 14000,
      inverter: true,
      energyClass: "A+",
      rating: 4.6,
      reviewCount: 7,
      badge: "Eficiență A+",
      categoryId: commercial.id,
    },
  });

  await prisma.review.createMany({
    data: [
      {
        name: "Ion Ceban",
        rating: 5,
        text: "Instalare rapidă și conditionerul lucrează foarte silențios. Recomand cu căldură serviciile Climat Rapid!",
        product: "Daikin Sensira FTXF35E",
      },
      {
        name: "Maria Rusu",
        rating: 5,
        text: "Am primit recomandare corectă pentru apartament. Echipa a fost profesionistă și atentă la detalii.",
        product: "Gree Pular GWH12AGC",
      },
      {
        name: "Andrei Popa",
        rating: 4.5,
        text: "Preț bun, livrare rapidă și suport ok. Sunt mulțumit de achiziție.",
        product: "Midea All Easy MSAGBU-12HRFN8",
      },
      {
        name: "Elena Moraru",
        rating: 5,
        text: "Foarte mulțumită de serviciul de mentenanță. Profesioniști adevărați!",
        product: "Mitsubishi Electric MSZ-HR35VF",
      },
    ],
  });

  await prisma.blogPost.createMany({
    data: [
      {
        title: "Cum alegi un conditioner potrivit?",
        slug: "cum-alegi-un-conditioner",
        description:
          "Ghid complet pentru alegerea condiționerului ideal în funcție de suprafața încăperii, necesarul de BTU și buget.",
        image:
          "https://placehold.co/600x400/e8f4fd/1d2353?text=Ghid+Alegere",
      },
      {
        title: "Ce înseamnă BTU?",
        slug: "ce-inseamna-btu",
        description:
          "Înțelege unitatea de măsură BTU și cum influențează puterea de răcire a unui condiționer.",
        image:
          "https://placehold.co/600x400/e8f4fd/1d2353?text=Ce+este+BTU",
      },
      {
        title: "Când trebuie făcută mentenanța?",
        slug: "cand-trebuie-facuta-mentenanta",
        description:
          "Programul optim de mentenanță pentru condiționerul tău: curățare filtre, verificare agent frigorific și mai mult.",
        image:
          "https://placehold.co/600x400/e8f4fd/1d2353?text=Mentenanta",
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

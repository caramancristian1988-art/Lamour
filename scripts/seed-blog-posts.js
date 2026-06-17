const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const posts = [
  {
    slug: "cum-alegi-conditionerul-potrivit",
    title: "Cum alegi aparatul de aer condiționat potrivit pentru casa ta?",
    description: "Află tot ce trebuie să știi pentru a alege un aparat de aer condiționat potrivit și eficient.",
    category: "Ghiduri",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "temperatura-ideala-vara",
    title: "Temperatura ideală vara: cât de rece ar trebui setat AC-ul?",
    description: "Descoperă care este temperatura optimă pentru confort și cum să economisești energie în același timp.",
    category: "Sfaturi",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "intretinerea-corecta-ac",
    title: "Întreținerea corectă a aparatului de aer condiționat",
    description: "Află practicile pentru prelungirea vieții și menținerea unui randament optim al aparatului tău.",
    category: "Întreținere",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "inverter-vs-on-off",
    title: "Inverter vs. On/Off — care este diferența?",
    description: "Află ce înseamnă tehnologia inverter și de ce este mai avantajoasă pentru tine pe termen lung.",
    category: "Tehnologie",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "noutati-climatizare-2024",
    title: "Noutăți în domeniul climatizării — 2024",
    description: "Descoperă cele mai noi funcții și tehnologii care diferențiază aparatele de acest an.",
    category: "Noutăți",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
  {
    slug: "reducere-consum-energie",
    title: "Cum să reduci consumul de energie al aparatului de aer condiționat",
    description: "7 sfaturi simple care te ajută să te bucuri de confort și să economisești la factură.",
    category: "Sfaturi",
    image: "/30634e25-d3ae-42fc-b1cd-cb9ab4ce60da.png",
  },
];

async function main() {
  let created = 0;
  let skipped = 0;

  for (const post of posts) {
    const existing = await prisma.blogPost.findUnique({ where: { slug: post.slug } });
    if (existing) {
      skipped++;
      continue;
    }
    await prisma.blogPost.create({ data: { ...post, published: true } });
    created++;
  }

  console.log(`✔ Adăugate ${created} articole noi, ${skipped} existau deja.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Hârtie igienică", slug: "hartie-igienica", description: "Hârtie igienică moale, din 100% celuloză.", image: "https://placehold.co/400x300/D8B2B1/652F37?text=Hartie+igienica" },
  { name: "Șervețele", slug: "servetele", description: "Șervețele de masă și de bucătărie.", image: "https://placehold.co/400x300/D8B2B1/652F37?text=Servetele" },
  { name: "Prosoape de hârtie", slug: "prosoape-de-hartie", description: "Prosoape de hârtie absorbante, pentru bucătărie.", image: "https://placehold.co/400x300/D8B2B1/652F37?text=Prosoape" },
  { name: "Șervețele umede", slug: "servetele-umede", description: "Șervețele umede pentru igiena zilnică.", image: "https://placehold.co/400x300/D8B2B1/652F37?text=Servetele+umede" },
  { name: "Chibrite", slug: "chibrite", description: "Chibrite de uz casnic.", image: "https://placehold.co/400x300/D8B2B1/652F37?text=Chibrite" },
  { name: "Alte produse", slug: "alte-produse", description: "Alte produse de uz casnic.", image: "https://placehold.co/400x300/D8B2B1/652F37?text=Alte+produse" },
];

// Example seed data — replace with your own real catalog before going live.
async function main() {
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.blogPost.deleteMany();
  await prisma.banner.deleteMany();

  const categories = {};
  for (const c of CATEGORIES) {
    categories[c.slug] = await prisma.category.create({ data: c });
  }

  const products = [
    { name: "Hârtie igienică L'amour Cu Dragoste, 32 role, 3 straturi", price: 120, oldPrice: 150, categorySlug: "hartie-igienica" },
    { name: "Hârtie igienică L'amour Cu Dragoste, 16 role, 3 straturi", price: 78, oldPrice: 95, categorySlug: "hartie-igienica" },
    { name: "Hârtie igienică L'amour Cu Dragoste, 8 role, 2 straturi", price: 45, oldPrice: null, categorySlug: "hartie-igienica" },
    { name: "Șervețele L'amour, 100 buc", price: 18, oldPrice: 24, categorySlug: "servetele" },
    { name: "Șervețele de masă L'amour, 50 buc", price: 12, oldPrice: null, categorySlug: "servetele" },
    { name: "Prosoape de hârtie L'amour, 2 role", price: 35, oldPrice: 41, categorySlug: "prosoape-de-hartie" },
    { name: "Prosoape de hârtie L'amour, 4 role", price: 62, oldPrice: null, categorySlug: "prosoape-de-hartie" },
    { name: "Șervețele umede L'amour, 72 buc", price: 30, oldPrice: 33, categorySlug: "servetele-umede" },
    { name: "Șervețele umede antibacteriene L'amour, 80 buc", price: 34, oldPrice: 39, categorySlug: "servetele-umede" },
    { name: "Șervețele umede pentru bebeluși L'amour, 64 buc", price: 22, oldPrice: null, categorySlug: "servetele-umede" },
    { name: "Chibrite L'amour, 10 cutii", price: 10, oldPrice: 12.5, categorySlug: "chibrite" },
    { name: "Detergent de vase L'amour, 500 ml", price: 28, oldPrice: null, categorySlug: "alte-produse" },
  ];

  for (const [i, p] of products.entries()) {
    const slug = `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${i + 1}`;
    await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: `${p.name} — produs L'amour Cu Dragoste, fabricat în Moldova din 100% celuloză.`,
        price: p.price,
        oldPrice: p.oldPrice,
        image: `https://placehold.co/400x400/ffffff/652F37?text=${encodeURIComponent(p.name.split(",")[0])}`,
        technology: "",
        rating: 4.5 + (i % 3) * 0.1,
        reviewCount: 8 + i * 3,
        categoryId: categories[p.categorySlug].id,
      },
    });
  }

  await prisma.review.createMany({
    data: [
      { name: "Maria G.", rating: 5, text: "Produse de calitate foarte bună! Recomand cu încredere.", product: "Hârtie igienică L'amour Cu Dragoste, 32 role, 3 straturi", approved: true },
      { name: "Ion P.", rating: 4.5, text: "Foarte mulțumită de hârtia igienică, moale și rezistentă.", product: "Hârtie igienică L'amour Cu Dragoste, 16 role, 3 straturi", approved: true },
      { name: "Anastasia L.", rating: 5, text: "O companie care chiar are grijă de oameni. Respect!", product: "Șervețele umede L'amour, 72 buc", approved: true },
    ],
  });

  await prisma.blogPost.createMany({
    data: [
      {
        title: "De ce contează numărul de straturi la hârtia igienică",
        slug: "de-ce-conteaza-numarul-de-straturi",
        description: "Ghid rapid despre diferența dintre 2 și 3 straturi, și ce înseamnă pentru confortul zilnic.",
        image: "https://placehold.co/600x400/D8B2B1/652F37?text=Noutati",
      },
    ],
  });

  await prisma.banner.createMany({
    data: [
      {
        image: "/50503435-901a-4bc2-8157-15bb46303786.png",
        alt: "Oferte speciale L'amour Cu Dragoste — pentru confortul fiecărei familii",
        title: null,
        subtitle: null,
        ctaLabel: "Vezi ofertele",
        link: "/produse?oferte=1",
        order: 0,
      },
      {
        image: "/banner-calitate-premium.png",
        alt: "Calitate premium în fiecare detaliu — L'amour Cu Dragoste",
        title: null,
        subtitle: null,
        ctaLabel: "Vezi produsele",
        link: "/produse",
        order: 1,
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

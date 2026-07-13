// Placeholder data shown only when the database is unreachable/empty, so pages
// still render something during local development or before the DB is seeded.
// Replace with content relevant to your own catalog, or just seed the database
// and let these fallbacks sit unused.

export const fallbackCategories = [
  {
    id: "1",
    name: "Hârtie igienică",
    slug: "hartie-igienica",
    description: "Hârtie igienică moale, din 100% celuloză.",
    image: "https://placehold.co/400x300/D8B2B1/652F37?text=Hartie+igienica",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Șervețele",
    slug: "servetele",
    description: "Șervețele de masă și de bucătărie.",
    image: "https://placehold.co/400x300/D8B2B1/652F37?text=Servetele",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Prosoape de hârtie",
    slug: "prosoape-de-hartie",
    description: "Prosoape de hârtie absorbante, pentru bucătărie.",
    image: "https://placehold.co/400x300/D8B2B1/652F37?text=Prosoape",
    createdAt: new Date(),
  },
  {
    id: "4",
    name: "Șervețele umede",
    slug: "servetele-umede",
    description: "Șervețele umede pentru igiena zilnică.",
    image: "https://placehold.co/400x300/D8B2B1/652F37?text=Servetele+umede",
    createdAt: new Date(),
  },
  {
    id: "5",
    name: "Chibrite",
    slug: "chibrite",
    description: "Chibrite de uz casnic.",
    image: "https://placehold.co/400x300/D8B2B1/652F37?text=Chibrite",
    createdAt: new Date(),
  },
  {
    id: "6",
    name: "Alte produse",
    slug: "alte-produse",
    description: "Alte produse de uz casnic.",
    image: "https://placehold.co/400x300/D8B2B1/652F37?text=Alte+produse",
    createdAt: new Date(),
  },
  {
    id: "7",
    name: "Produse de uz casnic",
    slug: "produse-de-uz-casnic",
    description: "Produse de curățenie și uz casnic pentru fiecare zi.",
    image: "https://placehold.co/400x300/D8B2B1/652F37?text=Uz+casnic",
    createdAt: new Date(),
  },
];

interface ProductSeed {
  id: string;
  name: string;
  price: number;
  oldPrice: number | null;
  categoryId: string;
  badge?: string | null;
}

const productSeeds: ProductSeed[] = [
  { id: "1", name: "Hârtie igienică L'amour Cu Dragoste, 32 role, 3 straturi", price: 120, oldPrice: 150, categoryId: "1" },
  { id: "2", name: "Prosoape de hârtie L'amour, 2 role", price: 35, oldPrice: 41, categoryId: "3" },
  { id: "3", name: "Șervețele L'amour, 100 buc", price: 18, oldPrice: 24, categoryId: "2" },
  { id: "4", name: "Chibrite L'amour, 10 cutii", price: 10, oldPrice: 12.5, categoryId: "5" },
  { id: "5", name: "Șervețele umede L'amour, 72 buc", price: 30, oldPrice: 33, categoryId: "4" },
  { id: "6", name: "Hârtie igienică L'amour Cu Dragoste, 8 role, 2 straturi", price: 45, oldPrice: null, categoryId: "1" },
  { id: "7", name: "Șervețele de masă L'amour, 50 buc", price: 12, oldPrice: null, categoryId: "2" },
  { id: "8", name: "Prosoape de hârtie L'amour, 4 role", price: 62, oldPrice: null, categoryId: "3" },
  { id: "9", name: "Șervețele umede pentru bebeluși L'amour, 64 buc", price: 22, oldPrice: null, categoryId: "4" },
  { id: "10", name: "Detergent de vase L'amour, 500 ml", price: 28, oldPrice: null, categoryId: "6" },
  { id: "11", name: "Hârtie igienică L'amour Cu Dragoste, 16 role, 3 straturi", price: 78, oldPrice: 95, categoryId: "1" },
  { id: "12", name: "Șervețele umede antibacteriene L'amour, 80 buc", price: 34, oldPrice: 39, categoryId: "4" },
];

function toProduct(seed: ProductSeed) {
  const discount = seed.oldPrice ? Math.round((1 - seed.price / seed.oldPrice) * 100) : null;
  return {
    id: seed.id,
    name: seed.name,
    slug: `produs-${seed.id}`,
    description: `${seed.name} — produs L'amour Cu Dragoste, fabricat în Moldova din 100% celuloză.`,
    price: seed.price,
    oldPrice: seed.oldPrice,
    image: `https://placehold.co/400x400/ffffff/652F37?text=${encodeURIComponent(seed.name.split(",")[0])}`,
    packageQuantity: null as string | null,
    rating: 4.7,
    reviewCount: 12,
    badge: seed.badge ?? (discount ? `-${discount}%` : null),
    availability: "În stoc",
    categoryId: seed.categoryId,
    createdAt: new Date(),
  };
}

export const fallbackProducts = productSeeds.slice(0, 4).map(toProduct);

export const fallbackPopularProducts = productSeeds.slice(4, 8).map(toProduct);

export const fallbackOfferProducts = productSeeds.filter((p) => p.oldPrice).map(toProduct);

export const fallbackDiscountProducts = productSeeds.slice(8, 12).map(toProduct);

export const fallbackReviews = [
  {
    id: "1",
    name: "Maria G.",
    rating: 5,
    text: "Produse de calitate foarte bună! Recomand cu încredere.",
    product: "Hârtie igienică L'amour Cu Dragoste, 32 role, 3 straturi",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Ion P.",
    rating: 4.5,
    text: "Foarte mulțumită de hârtia igienică, moale și rezistentă.",
    product: "Hârtie igienică L'amour Cu Dragoste, 16 role, 3 straturi",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Anastasia L.",
    rating: 5,
    text: "O companie care chiar are grijă de oameni. Respect!",
    product: "Șervețele umede L'amour, 72 buc",
    createdAt: new Date(),
  },
];

export const fallbackBlogPosts = [
  {
    id: "1",
    title: "De ce contează numărul de straturi la hârtia igienică",
    slug: "de-ce-conteaza-numarul-de-straturi",
    description: "Ghid rapid despre diferența dintre 2 și 3 straturi, și ce înseamnă pentru confortul zilnic.",
    image: "https://placehold.co/600x400/D8B2B1/652F37?text=Noutati",
    content: null,
    createdAt: new Date(),
  },
];

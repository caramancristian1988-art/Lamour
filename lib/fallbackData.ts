// Placeholder data shown only when the database is unreachable/empty, so pages
// still render something during local development or before the DB is seeded.
// Replace with content relevant to your own catalog, or just seed the database
// and let these fallbacks sit unused.

export const fallbackCategories = [
  {
    id: "1",
    name: "Category one",
    slug: "category-one",
    description: "Placeholder category description",
    image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Category+1",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Category two",
    slug: "category-two",
    description: "Placeholder category description",
    image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Category+2",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "Category three",
    slug: "category-three",
    description: "Placeholder category description",
    image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Category+3",
    createdAt: new Date(),
  },
];

function placeholderProduct(n: number, categoryId = "1") {
  return {
    id: String(n),
    name: `Placeholder product ${n}`,
    slug: `placeholder-product-${n}`,
    description: "Placeholder product description.",
    price: 999,
    oldPrice: n % 2 === 0 ? 1299 : null,
    image: `https://placehold.co/400x400/f0f7ff/1d2353?text=Product+${n}`,
    btu: null as number | null,
    technology: "Standard",
    energyClass: "A",
    rating: 4.5,
    reviewCount: 10,
    badge: n % 2 === 0 ? "-20%" : null,
    availability: "În stoc",
    categoryId,
    createdAt: new Date(),
  };
}

export const fallbackProducts = [1, 2, 3, 4].map((n) => placeholderProduct(n));

export const fallbackPopularProducts = [5, 6, 7, 8].map((n) => placeholderProduct(n));

export const fallbackOfferProducts = [9, 10, 11, 12].map((n) => placeholderProduct(n));

export const fallbackDiscountProducts = [13, 14, 15, 16].map((n) => placeholderProduct(n));

export const fallbackReviews = [
  {
    id: "1",
    name: "Client placeholder",
    rating: 5,
    text: "Placeholder review text.",
    product: "Placeholder product 1",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Client placeholder",
    rating: 4.5,
    text: "Placeholder review text.",
    product: "Placeholder product 2",
    createdAt: new Date(),
  },
];

export const fallbackBlogPosts = [
  {
    id: "1",
    title: "Placeholder blog post title",
    slug: "placeholder-blog-post",
    description: "Placeholder blog post description.",
    image: "https://placehold.co/600x400/e8f4fd/1d2353?text=Blog+Post",
    content: null,
    createdAt: new Date(),
  },
];

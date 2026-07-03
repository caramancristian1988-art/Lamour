const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Example seed data — replace with your own catalog before going live.
async function main() {
  await prisma.review.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.blogPost.deleteMany();

  const categoryOne = await prisma.category.create({
    data: {
      name: "Category one",
      slug: "category-one",
      description: "Placeholder category description",
      image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Category+1",
    },
  });

  const categoryTwo = await prisma.category.create({
    data: {
      name: "Category two",
      slug: "category-two",
      description: "Placeholder category description",
      image: "https://placehold.co/400x300/e8f4fd/1d2353?text=Category+2",
    },
  });

  await prisma.product.create({
    data: {
      name: "Placeholder product 1",
      slug: "placeholder-product-1",
      description: "Placeholder product description.",
      price: 999,
      oldPrice: 1299,
      image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Product+1",
      technology: "Standard",
      energyClass: "A",
      rating: 4.8,
      reviewCount: 24,
      badge: "A",
      categoryId: categoryOne.id,
    },
  });

  await prisma.product.create({
    data: {
      name: "Placeholder product 2",
      slug: "placeholder-product-2",
      description: "Placeholder product description.",
      price: 799,
      image: "https://placehold.co/400x400/f0f7ff/1d2353?text=Product+2",
      technology: "Standard",
      energyClass: "A++",
      rating: 4.6,
      reviewCount: 15,
      categoryId: categoryTwo.id,
    },
  });

  await prisma.review.createMany({
    data: [
      {
        name: "Client placeholder",
        rating: 5,
        text: "Placeholder review text.",
        product: "Placeholder product 1",
      },
      {
        name: "Client placeholder",
        rating: 4.5,
        text: "Placeholder review text.",
        product: "Placeholder product 2",
      },
    ],
  });

  await prisma.blogPost.createMany({
    data: [
      {
        title: "Placeholder blog post title",
        slug: "placeholder-blog-post",
        description: "Placeholder blog post description.",
        image: "https://placehold.co/600x400/e8f4fd/1d2353?text=Blog+Post",
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

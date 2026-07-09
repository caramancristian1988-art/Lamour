import { prisma } from "@/lib/prisma";
import { fallbackCategories, fallbackOfferProducts } from "@/lib/fallbackData";
import Hero from "@/app/components/Hero";
import BusinessDivisions from "@/app/components/BusinessDivisions";
import CategoryGrid from "@/app/components/CategoryGrid";
import ProductsSection from "@/app/components/ProductsSection";
import ReviewsSection from "@/app/components/ReviewsSection";
import AboutTeaser from "@/app/components/AboutTeaser";
import FactoryGallery from "@/app/components/FactoryGallery";
import SocialImpact from "@/app/components/SocialImpact";
import LatestProjects from "@/app/components/LatestProjects";
import LatestNews from "@/app/components/LatestNews";
import Partners from "@/app/components/Partners";
import DivisionCta from "@/app/components/division/DivisionCta";

export const revalidate = 3600;

async function getData() {
  try {
    const [categories, reviews, banners, projects, posts] = await Promise.all([
      prisma.category.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.review.findMany({
        where: { approved: true },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, name: true, rating: true, text: true, product: true },
      }),
      prisma.banner.findMany({ orderBy: { order: "asc" } }),
      prisma.project.findMany({ orderBy: { createdAt: "desc" }, take: 3 }),
      prisma.blogPost.findMany({
        where: { published: true },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { slug: true, title: true, description: true, category: true, image: true, createdAt: true },
      }),
    ]);
    return {
      categories,
      offerProducts: fallbackOfferProducts.slice(0, 4),
      reviews,
      banners,
      projects,
      posts,
    };
  } catch {
    return {
      categories: fallbackCategories,
      offerProducts: fallbackOfferProducts.slice(0, 4),
      reviews: [],
      banners: [],
      projects: [],
      posts: [],
    };
  }
}

export default async function HomePage() {
  const { categories, offerProducts, reviews, banners, projects, posts } = await getData();

  return (
    <main>
      <Hero banners={banners} />
      <BusinessDivisions />
      <AboutTeaser />
      <FactoryGallery />
      <SocialImpact />
      <CategoryGrid categories={categories} />
      <ProductsSection
        products={offerProducts}
        title="Oferte"
        highlighted="speciale"
        viewAllHref="/produse?oferte=1"
      />
      <LatestProjects projects={projects} />
      <LatestNews posts={posts} />
      <Partners />
      <DivisionCta
        title="Ai un proiect, o comandă sau o cerere de ofertă?"
        description="Scrie-ne — echipa noastră îți răspunde rapid cu o propunere personalizată."
        ctaLabel="Contactează-ne"
        ctaHref="/contact"
        className="pt-10"
      />
      <ReviewsSection reviews={reviews} />
    </main>
  );
}

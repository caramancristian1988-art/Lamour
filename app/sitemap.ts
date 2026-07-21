import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { getSectionFlags } from "@/lib/siteSettings";
import { absoluteUrl } from "@/lib/seo";

const BLOG_CATEGORY_SLUGS = ["ghiduri", "sfaturi", "noutati", "comunitate", "productie"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { produseEnabled, despreEnabled, blogEnabled, contactEnabled } = await getSectionFlags();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/mobila"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/spatii-comerciale"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/productie"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/productie-la-comanda"), changeFrequency: "monthly", priority: 0.4 },
    { url: absoluteUrl("/confidentialitate"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/termeni"), changeFrequency: "yearly", priority: 0.2 },
  ];

  if (produseEnabled) {
    staticRoutes.push({ url: absoluteUrl("/produse"), changeFrequency: "daily", priority: 0.9 });
  }
  if (despreEnabled) {
    staticRoutes.push({ url: absoluteUrl("/despre"), changeFrequency: "monthly", priority: 0.5 });
  }
  if (contactEnabled) {
    staticRoutes.push({ url: absoluteUrl("/contact"), changeFrequency: "monthly", priority: 0.5 });
    staticRoutes.push({ url: absoluteUrl("/faq"), changeFrequency: "monthly", priority: 0.4 });
  }
  if (blogEnabled) {
    staticRoutes.push({ url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.6 });
    for (const slug of BLOG_CATEGORY_SLUGS) {
      staticRoutes.push({ url: absoluteUrl(`/blog/categorie/${slug}`), changeFrequency: "weekly", priority: 0.4 });
    }
  }

  const dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const [furnitureListings, spaceListings] = await Promise.all([
      prisma.furnitureListing.findMany({ select: { slug: true, createdAt: true } }),
      prisma.spaceListing.findMany({ select: { slug: true, createdAt: true } }),
    ]);
    dynamicRoutes.push(
      ...furnitureListings.map((l) => ({
        url: absoluteUrl(`/mobila/${l.slug}`),
        lastModified: l.createdAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
      ...spaceListings.map((l) => ({
        url: absoluteUrl(`/spatii-comerciale/${l.slug}`),
        lastModified: l.createdAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    );
  } catch {
    // MongoDB unreachable at build/export time — ship the static routes only.
  }

  if (produseEnabled) {
    try {
      const [categories, products] = await Promise.all([
        prisma.category.findMany({ select: { slug: true, createdAt: true } }),
        prisma.product.findMany({ select: { slug: true, createdAt: true } }),
      ]);
      dynamicRoutes.push(
        ...categories.map((c) => ({
          url: absoluteUrl(`/produse/${c.slug}`),
          lastModified: c.createdAt,
          changeFrequency: "daily" as const,
          priority: 0.7,
        })),
        ...products.map((p) => ({
          url: absoluteUrl(`/produse/${p.slug}`),
          lastModified: p.createdAt,
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }))
      );
    } catch {
      // ignore — static routes already cover /produse
    }
  }

  if (blogEnabled) {
    try {
      const blogPosts = await prisma.blogPost.findMany({
        where: { published: true },
        select: { slug: true, createdAt: true },
      });
      dynamicRoutes.push(
        ...blogPosts.map((b) => ({
          url: absoluteUrl(`/blog/${b.slug}`),
          lastModified: b.createdAt,
          changeFrequency: "monthly" as const,
          priority: 0.5,
        }))
      );
    } catch {
      // ignore — static /blog route already listed
    }
  }

  return [...staticRoutes, ...dynamicRoutes];
}

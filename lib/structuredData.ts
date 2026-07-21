import { absoluteUrl, SITE_NAME } from "./seo";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Organization + WebSite + WebPage @graph for the homepage. Only includes fields backed by real data. */
export function homepageGraph({
  logoUrl,
  description,
}: {
  logoUrl?: string | null;
  description: string;
}) {
  const orgId = absoluteUrl("/#organization");
  const websiteId = absoluteUrl("/#website");
  const webpageId = absoluteUrl("/#webpage");

  const organization: Record<string, unknown> = {
    "@type": "Organization",
    "@id": orgId,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description,
  };
  if (logoUrl) {
    organization.logo = {
      "@type": "ImageObject",
      url: absoluteUrl(logoUrl),
    };
  }

  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: absoluteUrl("/"),
        name: SITE_NAME,
        publisher: { "@id": orgId },
        inLanguage: "ro",
      },
      {
        "@type": "WebPage",
        "@id": webpageId,
        url: absoluteUrl("/"),
        name: SITE_NAME,
        isPartOf: { "@id": websiteId },
        about: { "@id": orgId },
        inLanguage: "ro",
      },
    ],
  };
}

export interface CollectionItem {
  name: string;
  url: string;
  image?: string | null;
}

export function collectionPage({
  name,
  description,
  url,
  items,
}: {
  name: string;
  description?: string;
  url: string;
  items: CollectionItem[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    ...(description ? { description } : {}),
    url: absoluteUrl(url),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(item.url),
        name: item.name,
        ...(item.image ? { image: item.image } : {}),
      })),
    },
  };
}

export interface ProductSchemaInput {
  name: string;
  description?: string | null;
  image?: string | null;
  images?: string[];
  url: string;
  categoryName?: string | null;
  sku?: string | null;
  price?: number | null;
  priceCurrency?: string;
  availability?: string | null;
  countryOfOrigin?: string | null;
  material?: string | null;
  ratingValue?: number | null;
  reviewCount?: number | null;
  reviews?: { author: string; reviewBody: string; ratingValue: number }[];
}

function availabilitySchemaUrl(availability?: string | null): string | null {
  if (!availability) return null;
  const normalized = availability.toLowerCase();
  if (normalized.includes("stoc epuizat") || normalized.includes("indisponibil")) {
    return "https://schema.org/OutOfStock";
  }
  if (normalized.includes("comand")) return "https://schema.org/PreOrder";
  if (normalized.includes("stoc")) return "https://schema.org/InStock";
  return null;
}

/** Only includes offers/aggregateRating/review when the underlying real data is present. */
export function productSchema(input: ProductSchemaInput) {
  const images = input.images && input.images.length > 0 ? input.images : input.image ? [input.image] : [];

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    url: absoluteUrl(input.url),
  };

  if (input.description) schema.description = input.description;
  if (images.length > 0) schema.image = images;
  if (input.categoryName) schema.category = input.categoryName;
  if (input.sku) schema.sku = input.sku;
  if (input.material) schema.material = input.material;
  if (input.countryOfOrigin) schema.countryOfOrigin = input.countryOfOrigin;
  schema.brand = { "@type": "Brand", name: SITE_NAME };
  schema.manufacturer = { "@type": "Organization", name: SITE_NAME };

  const availabilityUrl = availabilitySchemaUrl(input.availability);
  if (input.price != null) {
    schema.offers = {
      "@type": "Offer",
      priceCurrency: input.priceCurrency ?? "MDL",
      price: input.price,
      url: absoluteUrl(input.url),
      ...(availabilityUrl ? { availability: availabilityUrl } : {}),
    };
  }

  if (input.ratingValue != null && input.reviewCount != null && input.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: input.ratingValue,
      reviewCount: input.reviewCount,
    };
  }

  if (input.reviews && input.reviews.length > 0) {
    schema.review = input.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.author },
      reviewBody: r.reviewBody,
      reviewRating: { "@type": "Rating", ratingValue: r.ratingValue },
    }));
  }

  return schema;
}

export function faqPageSchema(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function serviceSchema({
  name,
  description,
  url,
  areaServed,
}: {
  name: string;
  description: string;
  url: string;
  areaServed?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(url),
    provider: {
      "@type": "Organization",
      name: SITE_NAME,
      url: absoluteUrl("/"),
    },
    ...(areaServed ? { areaServed } : {}),
  };
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  image?: string | null;
  datePublished: string;
  dateModified?: string;
  url: string;
  authorName: string;
}

export function articleSchema(input: ArticleSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.headline,
    description: input.description,
    ...(input.image ? { image: [input.image] } : {}),
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    author: { "@type": "Organization", name: input.authorName },
    publisher: { "@type": "Organization", name: SITE_NAME },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(input.url),
    },
  };
}

export interface PlaceListingSchemaInput {
  type: "Apartment" | "Office" | "Store" | "Place";
  name: string;
  description?: string | null;
  image?: string | null;
  url: string;
  priceLabel?: string | null;
  price?: number | null;
  areaSquareMeters?: number | null;
  address?: string | null;
}

export function placeListingSchema(input: PlaceListingSchemaInput) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": input.type,
    name: input.name,
    url: absoluteUrl(input.url),
  };
  if (input.description) schema.description = input.description;
  if (input.image) schema.photo = input.image;
  if (input.address) {
    schema.address = { "@type": "PostalAddress", addressLocality: input.address, addressCountry: "MD" };
  }
  if (input.areaSquareMeters != null) {
    schema.floorSize = { "@type": "QuantitativeValue", value: input.areaSquareMeters, unitCode: "MTK" };
  }
  if (input.price != null) {
    schema.offers = {
      "@type": "Offer",
      price: input.price,
      priceCurrency: "EUR",
      businessFunction: "http://purl.org/goodrelations/v1#LeaseOut",
      url: absoluteUrl(input.url),
    };
  }
  return schema;
}

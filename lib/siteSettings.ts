import { cache } from "react";
import { prisma } from "./prisma";

export interface SectionFlags {
  produseEnabled: boolean;
  serviciiEnabled: boolean;
  proiecteEnabled: boolean;
  despreEnabled: boolean;
  blogEnabled: boolean;
  contactEnabled: boolean;
  ratesEnabled: boolean;
  installmentMonths: number;
}

const DEFAULTS: SectionFlags = {
  produseEnabled: true,
  serviciiEnabled: true,
  proiecteEnabled: false,
  despreEnabled: true,
  blogEnabled: true,
  contactEnabled: true,
  ratesEnabled: true,
  installmentMonths: 4,
};

export const getSectionFlags = cache(async (): Promise<SectionFlags> => {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return DEFAULTS;
    return {
      produseEnabled: settings.produseEnabled ?? DEFAULTS.produseEnabled,
      serviciiEnabled: settings.serviciiEnabled ?? DEFAULTS.serviciiEnabled,
      proiecteEnabled: settings.proiecteEnabled ?? DEFAULTS.proiecteEnabled,
      despreEnabled: settings.despreEnabled ?? DEFAULTS.despreEnabled,
      blogEnabled: settings.blogEnabled ?? DEFAULTS.blogEnabled,
      contactEnabled: settings.contactEnabled ?? DEFAULTS.contactEnabled,
      ratesEnabled: settings.ratesEnabled ?? DEFAULTS.ratesEnabled,
      installmentMonths: settings.installmentMonths ?? DEFAULTS.installmentMonths,
    };
  } catch {
    return DEFAULTS;
  }
});

export interface HeaderCategory {
  id: string;
  slug: string;
  name: string;
  image: string | null;
}

export const getHeaderCategories = cache(async (): Promise<HeaderCategory[]> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, slug: true, name: true, image: true },
    });
    return categories;
  } catch {
    return [];
  }
});

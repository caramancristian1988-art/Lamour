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

export interface SocialLinks {
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
}

const SOCIAL_DEFAULTS: SocialLinks = {
  facebook: null,
  instagram: "https://www.instagram.com/climatrapid_srl/",
  tiktok: null,
};

export const getSocialLinks = cache(async (): Promise<SocialLinks> => {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return SOCIAL_DEFAULTS;
    return {
      facebook: settings.facebook || SOCIAL_DEFAULTS.facebook,
      instagram: settings.instagram || SOCIAL_DEFAULTS.instagram,
      tiktok: settings.tiktok || SOCIAL_DEFAULTS.tiktok,
    };
  } catch {
    return SOCIAL_DEFAULTS;
  }
});

export interface ContactInfo {
  phone: string;
  phoneTel: string;
  phoneDigits: string;
  email: string;
}

const CONTACT_DEFAULTS: ContactInfo = {
  phone: "+373 69 000 000",
  phoneTel: "+37369000000",
  phoneDigits: "37369000000",
  email: "contact@climatrapid.md",
};

export const getContactInfo = cache(async (): Promise<ContactInfo> => {
  try {
    const settings = await prisma.settings.findFirst();
    if (!settings) return CONTACT_DEFAULTS;
    const phone = settings.phone || CONTACT_DEFAULTS.phone;
    const phoneTel = phone.replace(/[^\d+]/g, "");
    return {
      phone,
      phoneTel,
      phoneDigits: phoneTel.replace(/^\+/, ""),
      email: settings.email || CONTACT_DEFAULTS.email,
    };
  } catch {
    return CONTACT_DEFAULTS;
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

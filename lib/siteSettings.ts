import { cache } from "react";
import { prisma } from "./prisma";

export interface SectionFlags {
  produseEnabled: boolean;
  serviciiEnabled: boolean;
  proiecteEnabled: boolean;
  despreEnabled: boolean;
  blogEnabled: boolean;
  contactEnabled: boolean;
}

const DEFAULTS: SectionFlags = {
  produseEnabled: true,
  serviciiEnabled: true,
  proiecteEnabled: false,
  despreEnabled: true,
  blogEnabled: true,
  contactEnabled: true,
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
    };
  } catch {
    return DEFAULTS;
  }
});

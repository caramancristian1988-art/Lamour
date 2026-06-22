import { prisma } from "./prisma";

export interface ServiceStepData {
  nr: string;
  title: string;
  desc: string;
  img: string;
}

export interface ServiceFeatureData {
  title: string;
  desc: string;
  icon: string;
}

export interface ServiceTestimonialData {
  text: string;
  name: string;
  city: string;
  initials: string;
}

export interface ServiceDetailFallback {
  detailImage: string;
  heroImageDesktop: string;
  steps: ServiceStepData[];
  features: ServiceFeatureData[];
  checklist: string[];
  testimonials: ServiceTestimonialData[];
}

export async function getServiceDetail(href: string, fallback: ServiceDetailFallback): Promise<ServiceDetailFallback> {
  try {
    const service = await prisma.service.findFirst({ where: { href } });
    if (!service) return fallback;

    const [steps, features, checklist, testimonials] = await Promise.all([
      prisma.serviceStep.findMany({ where: { serviceId: service.id }, orderBy: { order: "asc" } }),
      prisma.serviceFeature.findMany({ where: { serviceId: service.id }, orderBy: { order: "asc" } }),
      prisma.serviceChecklistItem.findMany({ where: { serviceId: service.id }, orderBy: { order: "asc" } }),
      prisma.serviceTestimonial.findMany({ where: { serviceId: service.id }, orderBy: { order: "asc" } }),
    ]);

    return {
      detailImage: service.detailImage ?? fallback.detailImage,
      heroImageDesktop: service.heroImageDesktop ?? fallback.heroImageDesktop,
      steps: steps.length > 0
        ? steps.map((s, i) => ({
            nr: String(i + 1).padStart(2, "0"),
            title: s.title,
            desc: s.description,
            img: s.image ?? fallback.steps[i]?.img ?? fallback.steps[0].img,
          }))
        : fallback.steps,
      features: features.length > 0
        ? features.map((f) => ({ title: f.title, desc: f.description, icon: f.icon }))
        : fallback.features,
      checklist: checklist.length > 0 ? checklist.map((c) => c.text) : fallback.checklist,
      testimonials: testimonials.length > 0
        ? testimonials.map((t) => ({ text: t.text, name: t.name, city: t.city, initials: t.initials }))
        : fallback.testimonials,
    };
  } catch {
    return fallback;
  }
}

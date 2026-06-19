import { prisma } from "./prisma";

export interface ServiceStepData {
  nr: string;
  title: string;
  desc: string;
  img: string;
}

export interface ServiceDetailFallback {
  detailImage: string;
  steps: ServiceStepData[];
}

export async function getServiceDetail(href: string, fallback: ServiceDetailFallback): Promise<ServiceDetailFallback> {
  try {
    const service = await prisma.service.findFirst({ where: { href } });
    if (!service) throw new Error("not found");

    const steps = await prisma.serviceStep.findMany({
      where: { serviceId: service.id },
      orderBy: { order: "asc" },
    });
    if (steps.length === 0) throw new Error("no steps");

    return {
      detailImage: service.detailImage ?? fallback.detailImage,
      steps: steps.map((s, i) => ({
        nr: String(i + 1).padStart(2, "0"),
        title: s.title,
        desc: s.description,
        img: s.image ?? fallback.steps[i]?.img ?? fallback.steps[0].img,
      })),
    };
  } catch {
    return fallback;
  }
}

import { prisma } from "./prisma";

const COUNTER_NAME = "order";

/** Următorul număr de comandă, alocat atomic (Counter.value incrementat pe MongoDB). */
export async function nextOrderNumber(): Promise<string> {
  const counter = await prisma.counter.upsert({
    where: { name: COUNTER_NAME },
    update: { value: { increment: 1 } },
    create: { name: COUNTER_NAME, value: 1 },
  });
  return String(counter.value);
}

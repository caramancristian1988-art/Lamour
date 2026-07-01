import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const services = await prisma.service.findMany({ select: { id: true, title: true, href: true, section: true }, orderBy: { createdAt: "asc" } });
console.log(`Total services in DB: ${services.length}\n`);
services.forEach(s => console.log(`ID: ${s.id} | href: ${s.href ?? "NULL"} | title: ${s.title}`));
await prisma.$disconnect();

import { PrismaClient } from "@prisma/client";

// ป้องกันการสร้าง PrismaClient ซ้ำหลายอินสแตนซ์เวลา Next.js reload โค้ดระหว่างพัฒนา (Hot Reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

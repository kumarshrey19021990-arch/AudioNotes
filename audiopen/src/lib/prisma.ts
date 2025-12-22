import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function prisma() {
  // Lazy-init to avoid Next build-time module evaluation issues.
  if (globalForPrisma.prisma) return globalForPrisma.prisma;
  globalForPrisma.prisma = new PrismaClient();
  return globalForPrisma.prisma;
}


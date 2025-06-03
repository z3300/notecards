import { PrismaClient } from '@prisma/client';

declare module globalThis {
  var prisma: PrismaClient | undefined;
}

export const prisma: PrismaClient = globalThis.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma; 
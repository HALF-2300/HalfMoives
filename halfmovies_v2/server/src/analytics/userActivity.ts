import { PrismaClient } from '@prisma/client';

export async function logUserActivity(prisma: PrismaClient, userId: string | null, action: string, metadata?: Record<string, unknown>) {
  try {
    await prisma.userActivity.create({
      data: {
        userId: userId ?? null,
        action,
        metadata: metadata ? metadata : undefined
      }
    });
  } catch (err) {
    console.error('[analytics] failed to log activity', err);
  }
}

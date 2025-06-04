import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { ContentType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { publicModeConfig } from '@/config/public-mode';

const contentInputSchema = z.object({
  type: z.nativeEnum(ContentType),
  url: z.string().url(),
  title: z.string().min(1),
  note: z.string(),
  thumbnail: z.string().optional(),
  author: z.string().optional(),
  duration: z.string().optional(),
  location: z.string().optional(),
});

// Helper to protect mutation endpoints in public mode
const protectMutation = () => {
  if (publicModeConfig.isPublic) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'This action is not available in public mode',
    });
  }
};

export const contentRouter = router({
  getAll: publicProcedure.query(({ ctx }) =>
    ctx.prisma.contentItem.findMany({
      orderBy: { createdAt: 'desc' },
    })
  ),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.contentItem.findUnique({
        where: { id: input.id },
      })
    ),

  getByType: publicProcedure
    .input(z.object({ type: z.nativeEnum(ContentType) }))
    .query(({ ctx, input }) =>
      ctx.prisma.contentItem.findMany({
        where: { type: input.type },
        orderBy: { createdAt: 'desc' },
      })
    ),

  create: publicProcedure
    .input(contentInputSchema)
    .mutation(({ ctx, input }) => {
      protectMutation();
      return ctx.prisma.contentItem.create({
        data: {
          ...input,
          createdAt: new Date(),
        },
      });
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        data: contentInputSchema.partial(),
      })
    )
    .mutation(({ ctx, input }) => {
      protectMutation();
      return ctx.prisma.contentItem.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      protectMutation();
      return ctx.prisma.contentItem.delete({
        where: { id: input.id },
      });
    }),
}); 
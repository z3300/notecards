import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { ContentType } from '@prisma/client';

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

}); 
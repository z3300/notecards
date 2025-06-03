import { router } from './trpc';
import { contentRouter } from './routers/content';

export const appRouter = router({
  content: contentRouter,
});

export type AppRouter = typeof appRouter; 
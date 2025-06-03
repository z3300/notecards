---

## 📁 File & Directory Guide

### `/src/app/`
- **page.tsx**: Main dashboard page. Renders the grid of content cards and handles layout.
- **layout.tsx**: App-wide layout and providers.
- **providers.tsx**: React context providers for the app.
- **globals.css**: Global styles (Tailwind CSS).
- **api/**: Next.js API routes.
  - **/extract-metadata/route.ts**: POST endpoint for extracting metadata from pasted URLs (YouTube, Reddit, Twitter, etc.). Uses Cheerio for scraping and supports YouTube API if configured. **Now generates screenshots for articles automatically.**
  - **/generate-screenshot/route.ts**: POST endpoint for generating screenshots of web pages using Puppeteer. Used automatically for article thumbnails.
  - **/trpc/**: tRPC API handler for Next.js.

### `/src/components/`
- **AddContentForm.tsx**: Modal form for adding new content. Prompts user to paste a URL, auto-fills metadata via `/api/extract-metadata`, and allows manual editing before saving.
- **ContentCard.tsx**: The main card UI for displaying saved content. Supports flipping for notes, shows type/color dot, date/time, and content-specific embeds (YouTube, Twitter, etc.). **Now displays screenshot thumbnails for articles when available.**

### `/src/server/`
- **db.ts**: Prisma client instance for database access.
- **api/root.ts**: tRPC root router.
- **api/trpc.ts**: tRPC context and helper setup.
- **api/routers/content.ts**: tRPC router for content CRUD (create, get, update, delete). Handles all DB operations for content items.

### `/src/utils/`
- **trpc.ts**: tRPC client setup for React hooks.

### `/prisma/`
- **schema.prisma**: Prisma schema defining the `ContentItem` model and enums for content types.
- **seed.ts**: (If present) Script for seeding the database with initial data.
- **migrations/**: Auto-generated migration files.

### `/public/screenshots/`
- **Auto-generated**: Directory containing screenshot thumbnails for articles. These files are automatically generated and should not be committed to version control.

---

## 🧠 AI Guidance & Best Practices

- **Metadata Extraction**: Use `/api/extract-metadata/route.ts` for all URL parsing and metadata extraction. It supports YouTube, Reddit, Twitter/X, Spotify, SoundCloud, and generic articles. **For articles, it now automatically generates screenshot thumbnails using Puppeteer.**
- **Screenshot Generation**: The `/api/generate-screenshot/route.ts` endpoint uses Puppeteer to capture screenshots of web pages. Screenshots are saved to `/public/screenshots/` and served statically.
- **Adding Content**: Use `AddContentForm.tsx` for all new content. Always prompt for a URL first, then auto-fill using the metadata endpoint. Allow manual override for all fields.
- **Content Display**: Use `ContentCard.tsx` for rendering content. **Articles now display screenshot thumbnails when available, with fallback to the default icon.** The color dot should be aligned with the title text (not card center). Date and time are shown under the title, with location (if any) below.
- **Database**: The `createdAt` field in `ContentItem` is a full timestamp (date and time). Always set this to `new Date()` on creation. The `thumbnail` field stores the path to generated screenshots for articles.
- **API**: All backend CRUD for content should go through the tRPC router in `src/server/api/routers/content.ts`.
- **Styling**: Use Tailwind CSS utility classes for all styling. Keep UI minimal and modern.
- **Extending**: To add new content types, update the `ContentType` enum in `schema.prisma`, extend the metadata extraction logic, and update the UI components as needed.

---

## 📝 How to Add a New Feature

1. **Backend**: Add/extend tRPC routers in `src/server/api/routers/`.
2. **Frontend**: Add/modify React components in `src/components/`.
3. **Metadata**: Update `/api/extract-metadata/route.ts` for new content types.
4. **Screenshots**: Use `/api/generate-screenshot/route.ts` for any new content types that need visual thumbnails.
5. **Database**: Update `prisma/schema.prisma` and run `prisma migrate`.
6. **UI**: Use Tailwind for all new styles.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# Visit http://localhost:3000 (or the port shown in your terminal)
```

**Note**: Screenshot generation requires Puppeteer, which will download Chromium on first run. This may take a few minutes.

---

## 🤖 For AI Contributors

- **Always check this guide before making changes.**
- **Describe new files and their purpose here when you add them.**
- **Keep all logic modular and DRY.**
- **Screenshot functionality is automatically integrated for articles - no manual intervention needed.**
- **If in doubt, ask for clarification or check existing patterns.**

---

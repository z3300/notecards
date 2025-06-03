---

## 📁 File & Directory Guide

### `/src/app/`
- **page.tsx**: Main dashboard page. Renders the grid of content cards and handles layout.
- **layout.tsx**: App-wide layout and providers.
- **providers.tsx**: React context providers for the app.
- **globals.css**: Global styles (Tailwind CSS).
- **api/**: Next.js API routes.
  - **/extract-metadata/route.ts**: POST endpoint for extracting metadata from pasted URLs (YouTube, Reddit, Twitter, etc.). Uses Cheerio for scraping and supports YouTube API if configured. **Now supports optional screenshot generation with `generateScreenshot` parameter and improved Spotify metadata extraction with artist names and duration.**
  - **/generate-screenshot/route.ts**: POST endpoint for generating screenshots of web pages using Puppeteer. Used automatically for article thumbnails when requested.
  - **/trpc/**: tRPC API handler for Next.js.

### `/src/components/`
- **AddContentForm.tsx**: Modal form for adding new content. Prompts user to paste a URL, auto-fills metadata via `/api/extract-metadata`, and allows manual editing before saving. **Now includes screenshot toggle, preview functionality, and error handling.**
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

- **Metadata Extraction**: Use `/api/extract-metadata/route.ts` for all URL parsing and metadata extraction. It supports YouTube, **Reddit (with enhanced post metadata including scores, comments, and subreddit info)**, Twitter/X, **Spotify (with enhanced artist and duration extraction)**, SoundCloud, and generic articles. **For articles, users can choose whether to generate screenshots via a checkbox, but the system now intelligently checks for existing thumbnails first.**
- **Screenshot Generation**: The `/api/generate-screenshot/route.ts` endpoint uses Puppeteer to capture screenshots of web pages. Screenshots are saved to `/public/screenshots/` and served statically.
- **Adding Content**: Use `AddContentForm.tsx` for all new content. **Features include:**
  - Screenshot toggle checkbox (checked by default)
  - Screenshot preview with remove button (X)
  - Error handling with warning messages
  - Ability to proceed even if screenshot fails
- **Content Display**: Use `ContentCard.tsx` for rendering content. **Articles now display screenshot thumbnails when available, with fallback to the default icon.** The color dot should be aligned with the title text (not card center). Date and time are shown under the title, with location (if any) below.
- **Database**: The `createdAt` field in `ContentItem` is a full timestamp (date and time). Always set this to `new Date()` on creation. The `thumbnail` field stores the path to generated screenshots for articles.
- **API**: All backend CRUD for content should go through the tRPC router in `src/server/api/routers/content.ts`.
- **Styling**: Use Tailwind CSS utility classes for all styling. Keep UI minimal and modern.
- **Extending**: To add new content types, update the `ContentType` enum in `schema.prisma`, extend the metadata extraction logic, and update the UI components as needed.

---

## 🖼️ Screenshot Feature Details

### **User Controls:**
- **Checkbox**: "Generate screenshot for articles" (checked by default)
- **Preview**: Shows generated screenshot with remove button (X)
- **Error Handling**: Yellow warning if screenshot fails, but user can still proceed
- **Flexible**: Works for articles only, other content types use existing thumbnails

### **API Parameters:**
```typescript
// Metadata extraction with optional screenshot
POST /api/extract-metadata
{
  "url": "https://example.com",
  "generateScreenshot": true|false  // Optional, defaults to true
}
```

### **Error States:**
- Screenshot generation failure: Shows warning, allows proceeding
- Network issues: Graceful fallback to metadata-only
- Invalid URLs: Standard validation errors

---

## 🎵 Enhanced Spotify Integration

### **Improved Metadata Extraction:**
- **Artist Names**: Cleanly extracts primary artist name (e.g., "The Killers" instead of "The Killers · Hot Fuss · Song · 2004")
- **Duration**: Extracts track duration in MM:SS format from multiple sources
- **Content Types**: Supports tracks, albums, and playlists
- **Thumbnails**: High-quality album artwork URLs
- **Fallback Methods**: Multiple extraction strategies for reliability

### **Extraction Sources:**
1. **Open Graph metadata** - Primary source for title and thumbnails
2. **Structured JSON-LD data** - For duration and detailed artist info
3. **Spotify's embedded data** - From internal JavaScript objects
4. **Meta tags** - Music-specific duration and artist metadata

### **Example Response:**
```json
{
  "success": true,
  "data": {
    "type": "spotify",
    "title": "Mr. Brightside",
    "author": "The Killers",
    "thumbnailUrl": "https://i.scdn.co/image/ab67616d0000b273...",
    "duration": "3:42",
    "description": "Listen to Mr. Brightside on Spotify..."
  }
}
```

---

## 📰 Enhanced Reddit Integration

### **Improved Metadata Extraction:**
- **Post Statistics**: Extracts upvote score, comment count, and post age
- **Subreddit Information**: Clean formatting with "r/subreddit" prefix
- **Author Handling**: Consistent "u/username" formatting with [deleted] user support
- **Post Types**: Distinguishes between text posts and link posts
- **Smart Descriptions**: Combines post text with community stats for better context
- **Thumbnail Handling**: Filters out Reddit's special thumbnail values (self, default, nsfw, spoiler)

### **Extraction Sources:**
1. **Reddit JSON API** - Primary source for comprehensive post data
2. **Web scraping fallback** - When JSON API is unavailable
3. **Open Graph metadata** - For basic title and description
4. **URL parsing** - For subreddit extraction from URLs

### **Enhanced Data Points:**
- **Post Score**: Upvotes minus downvotes
- **Comment Count**: Total number of comments
- **Time Information**: "5h ago" or "2d ago" formatting
- **Subreddit Context**: Clean "r/programming" formatting
- **NSFW Detection**: Identifies adult content posts
- **Post Classification**: Text posts vs. link posts

### **Example Response:**
```json
{
  "success": true,
  "data": {
    "type": "reddit",
    "title": "TIL about an interesting programming concept",
    "author": "u/developer123",
    "description": "245 points • 67 comments • 4h ago in r/programming",
    "thumbnailUrl": "https://preview.redd.it/...",
    "metadata": {
      "subreddit": "programming",
      "score": 245,
      "numComments": 67,
      "isNsfw": false,
      "postType": "text"
    }
  }
}
```

---

## 🤖 Intelligent Screenshot System

### **Smart Thumbnail Detection:**
- **Existing Thumbnail Check**: Automatically detects if a website already has preview images
- **Multiple Source Scanning**: Checks Open Graph, Twitter Cards, and other meta tags
- **Screenshot as Fallback**: Only generates screenshots when no existing thumbnail is found
- **Resource Optimization**: Reduces unnecessary screenshot generation and storage

### **Detection Sources (in order of priority):**
1. `og:image` - Open Graph images (primary standard)
2. `twitter:image` - Twitter Card images  
3. `name="image"` - Generic image meta tags
4. `rel="image_src"` - Legacy image source links

### **Intelligent Logic:**
```javascript
// Enhanced screenshot decision process
if (generateScreenshot && type === 'article' && !existingThumbnail) {
  // Generate screenshot only when needed
  generateScreenshot();
} else if (existingThumbnail) {
  // Use the website's own preview image
  useExistingThumbnail();
}
```

### **Benefits:**
- **Faster Loading**: Uses existing thumbnails when available
- **Storage Efficiency**: Reduces screenshot file generation and storage needs
- **Better Quality**: Often existing thumbnails are better than screenshots
- **Bandwidth Optimization**: Leverages CDNs for existing images

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
- **Screenshot functionality includes user controls and error handling - respect user preferences.**
- **Spotify metadata extraction uses multiple fallback strategies - maintain this robustness.**
- **If in doubt, ask for clarification or check existing patterns.**

---

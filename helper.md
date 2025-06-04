

## 📁 File & Directory Guide


### `/src/lib/`
- **metadata-extractor.js**: Shared metadata extraction module used across the application. Handles YouTube, Reddit, Twitter, Spotify, **movies (IMDb, TMDb, Letterboxd), books (Goodreads, Google Books, Amazon),** and generic article parsing.

### `/src/app/`
- **page.tsx**: Main dashboard page. Renders the grid of content cards and handles layout.
- **layout.tsx**: App-wide layout and providers.
- **providers.tsx**: React context providers for the app.
- **globals.css**: Global styles (Tailwind CSS).
- **api/**: Next.js API routes.
  - **/extract-metadata/route.ts**: POST endpoint for extracting metadata from pasted URLs (YouTube, Reddit, Twitter, **movies, books,** etc.). Uses Cheerio for scraping and supports YouTube API if configured. Includes Spotify, movie and book parsing.
  - **/trpc/**: tRPC API handler for Next.js.

### `/src/components/`
- **ContentCard.tsx**: The main card UI for displaying saved content. Supports flipping for notes, shows type/color dot, date/time, and embeds (YouTube, Twitter, etc.). Includes movie and book cards with proper thumbnails.

### `/src/server/`
- **db.ts**: Prisma client instance for database access.
- **api/root.ts**: tRPC root router.
- **api/trpc.ts**: tRPC context and helper setup.
- **api/routers/content.ts**: tRPC router for fetching content from the database.

### `/src/utils/`
- **trpc.ts**: tRPC client setup for React hooks.

### `/prisma/`
- **schema.prisma**: Prisma schema defining the `ContentItem` model and enums for content types.
- **seed.ts**: (If present) Script for seeding the database with initial data.
- **migrations/**: Auto-generated migration files.

## 🧠 AI Guidance & Best Practices

- **Shared Modules**: The `src/lib/metadata-extractor.js` module is used by the API to keep metadata logic in one place.
- **Metadata Extraction**: Use `/api/extract-metadata/route.ts` for all URL parsing and metadata extraction. It supports YouTube, **Reddit (with enhanced post metadata including scores, comments, and subreddit info)**, Twitter/X, **Spotify (with enhanced artist and duration extraction)**, SoundCloud, **movies (IMDb, TMDb, Letterboxd with director, year, rating, runtime), books (Goodreads, Google Books, Amazon with author, page count, publication year, rating),** and generic articles.
- **Content Display**: Use `ContentCard.tsx` for rendering content. Movies and books show poster or cover images with emoji fallbacks. The color dot aligns with the title text. Date and time are shown under the title, with location (if any) below.
- **Database**: The `createdAt` field in `ContentItem` is a full timestamp (date and time). Always set this to `new Date()` on creation. The `thumbnail` field stores a preview image URL for each item.
- **API**: All backend CRUD for content should go through the tRPC router in `src/server/api/routers/content.ts`.
- **Styling**: Use Tailwind CSS utility classes for all styling. Keep UI minimal and modern.
- **Extending**: To add new content types, update the `ContentType` enum in `schema.prisma`, extend the metadata extraction logic, and update the UI components as needed.

---

## 🎬 Movie Integration

### **Supported Sources:**
- **IMDb**: Full movie metadata including title, director, year, rating, poster, plot, runtime
- **TMDb (The Movie Database)**: Movie details with high-quality posters and metadata  
- **Letterboxd**: Film reviews and ratings with poster images
- **Generic movie pages**: Fallback to Open Graph metadata

### **Extracted Data:**
- **Title**: Movie title with release year (e.g., "Inception (2010)")
- **Director**: Formatted as "Directed by [Director Name]"
- **Poster**: High-quality movie poster images
- **Runtime**: Formatted as "2h 28m" or "148m"
- **Rating**: IMDb rating, TMDb score, or Letterboxd average
- **Plot**: Movie synopsis/description
- **Year**: Release year automatically appended to title

### **Example URLs:**
```bash
# IMDb
https://www.imdb.com/title/tt1375666/

# TMDb  
https://www.themoviedb.org/movie/27205-inception

# Letterboxd
https://letterboxd.com/film/inception/
```

---

## 📚 Book Integration  

### **Supported Sources:**
- **Goodreads**: Complete book metadata including title, author, rating, cover, description, page count
- **Google Books**: Book details with cover images and publication info
- **Amazon Books**: Book pages with author, cover, ratings, page count
- **Generic book pages**: Fallback to Open Graph and book-specific meta tags

### **Extracted Data:**
- **Title**: Book title as published
- **Author**: Formatted as "by [Author Name]"
- **Cover**: Book cover images from various sources
- **Page Count**: Used in duration field as "[XXX] pages"
- **Rating**: Goodreads rating, Amazon stars, etc.
- **Description**: Book synopsis/description  
- **Publication Year**: Year of publication
- **Publisher**: When available

### **Example URLs:**
```bash
# Goodreads
https://www.goodreads.com/book/show/11297.The_Name_of_the_Wind

# Google Books
https://books.google.com/books?id=ABC123

# Amazon Books
https://www.amazon.com/dp/0756404746
```

---

## 🎨 Visual Design

### **Content Type Colors:**
- YouTube: Red (`bg-red-500`)
- Article: Blue (`bg-blue-500`) 
- Reddit: Orange (`bg-orange-500`)
- Twitter: Sky (`bg-sky-500`)
- Spotify: Green (`bg-green-500`)
- SoundCloud: Orange (`bg-orange-600`)
- **Movie: Purple (`bg-purple-500`)**
- **Book: Amber (`bg-amber-500`)**

### **Content Type Icons:**
- YouTube: ▶️
- Article: 📄
- Reddit: 💬  
- Twitter: 🐦
- Spotify: 🎵
- SoundCloud: 🎧
- **Movie: ��**
- **Book: 📚**

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

## 📝 How to Add a New Feature

1. **Backend**: Add/extend tRPC routers in `src/server/api/routers/`.
2. **Frontend**: Add/modify React components in `src/components/`.
3. **Metadata**: Update `/api/extract-metadata/route.ts` AND `src/lib/metadata-extractor.js` for new content types.
4. **Database**: Update `prisma/schema.prisma` and run `prisma migrate`.
5. **UI**: Use Tailwind for all new styles.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# Visit http://localhost:3000 (or the port shown in your terminal)
```

---

## 🤖 For AI Contributors

- **Always check this guide before making changes.**
- **Describe new files and their purpose here when you add them.**
- **Keep all logic modular and DRY.**
- **Spotify metadata extraction uses multiple fallback strategies - maintain this robustness.**
- **If in doubt, ask for clarification or check existing patterns.**

---

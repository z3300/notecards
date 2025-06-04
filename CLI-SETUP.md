# Notecards CLI Setup & Usage

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Make CLI Executable (if needed)
```bash
chmod +x cli/notecard.js
```

### 3. Link CLI Globally (Optional)
```bash
npm link
```
After linking, you can use `notecard` command from anywhere.

## 📝 Usage

### Basic Usage
```bash
# Using npm script
npm run cli <url> [note]

# Using node directly
node cli/notecard.js <url> [note]

# If globally linked
notecard <url> [note]
```

### Examples

**Add a YouTube video:**
```bash
notecard "https://youtube.com/watch?v=dQw4w9WgXcQ" "Great song!"
```

**Add a Reddit post:**
```bash
notecard "https://reddit.com/r/programming/comments/xyz" "Interesting discussion"
```

**Add an article:**
```bash
notecard "https://example.com/article" "Must read later"
```

**Add without initial note (you'll be prompted):**
```bash
notecard "https://example.com/article"
```

## 🎯 Interactive Features

When you run the CLI, it will:

1. **Extract metadata** automatically from the URL
2. **Show current data** and let you edit:
   - Title
   - Author
   - Description
   - Your personal note
   - Location (optional)
3. **Ask about screenshots** for articles
4. **Save to database** and confirm success

## 🔧 Technical Details

### Prerequisites
- Your Next.js development server must be running (`npm run dev`) for screenshot generation
- Database must be accessible (same Prisma setup as web app)
- All environment variables should be configured

### What It Does
- Reuses your existing metadata extraction logic
- Connects to the same database as your web app
- Supports all the same content types (YouTube, Reddit, Twitter, Spotify, articles)
- Generates screenshots for articles (if web server is running)
- Shows immediate confirmation and provides content ID

### Troubleshooting

**"Failed to extract metadata"**
- Check your internet connection
- Verify the URL is accessible
- Some sites may block automated requests

**"Database connection failed"**
- Ensure your database is running
- Check your environment variables
- Make sure Prisma schema is up to date

**"Screenshot generation failed"**
- Ensure your Next.js dev server is running (`npm run dev`)
- Screenshots are optional, the content will still be saved

## 🌐 Integration with Web App

Content added via CLI will immediately appear in your web dashboard. The CLI uses the same:
- Database (Prisma)
- Content types and schema
- Metadata extraction logic
- Screenshot generation API

No additional setup required - just add content from the command line and see it on your web interface!

## 🎨 Advanced Usage

### Batch Adding (Future Enhancement)
You could extend the CLI to support multiple URLs:
```bash
notecard file-with-urls.txt
```

### Custom Content Types
The CLI automatically detects content types, but you could modify it to support custom types or override detection.

### Environment-Specific Configs
You can use different environments by setting different DATABASE_URL values. 
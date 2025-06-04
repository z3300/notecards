#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Import the metadata extraction logic
const { extractMetadata } = require('../src/lib/metadata-extractor');

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Usage: notecard <url> [note]');
    console.log('Example: notecard https://youtube.com/watch?v=xyz "Great tutorial"');
    process.exit(1);
  }

  const url = args[0];
  const initialNote = args.slice(1).join(' ') || '';

  try {
    console.log('🔍 Extracting metadata...');
    
    // Extract metadata using existing logic
    const metadata = await extractMetadata(url);
    
    if (!metadata.success) {
      console.error('❌ Failed to extract metadata:', metadata.error);
      process.exit(1);
    }

    console.log('✅ Metadata extracted successfully!');
    console.log('');

    // Dynamic import for inquirer (required for v12+)
    const inquirer = (await import('inquirer')).default;

    // Show current metadata and allow editing
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Title:',
        default: metadata.data.title,
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author:',
        default: metadata.data.author || '',
      },
      {
        type: 'input',
        name: 'note',
        message: 'Your note:',
        default: initialNote,
      },
      {
        type: 'input',
        name: 'location',
        message: 'Location (optional):',
        default: '',
      },
      {
        type: 'confirm',
        name: 'generateScreenshot',
        message: 'Generate screenshot? (for articles)',
        default: metadata.data.type === 'article',
        when: () => metadata.data.type === 'article'
      }
    ]);

    console.log('');
    console.log('💾 Saving to database...');

    // Generate screenshot if requested
    let thumbnailPath = metadata.data.thumbnailUrl;
    if (answers.generateScreenshot && metadata.data.type === 'article') {
      console.log('📸 Generating screenshot...');
      try {
        const screenshotResult = await generateScreenshot(url);
        if (screenshotResult.success) {
          thumbnailPath = screenshotResult.path;
          console.log('✅ Screenshot generated');
        }
      } catch (error) {
        console.log('⚠️  Screenshot generation failed, continuing...');
      }
    }

    // Save to database
    const contentItem = await prisma.contentItem.create({
      data: {
        type: metadata.data.type,
        title: answers.title,
        url: url,
        note: answers.note || '',
        author: answers.author || null,
        thumbnail: thumbnailPath || null,
        duration: metadata.data.duration || null,
        location: answers.location || null,
        createdAt: new Date(),
      },
    });

    console.log('✅ Content saved successfully!');
    console.log(`📝 ID: ${contentItem.id}`);
    console.log(`🏷️  Type: ${contentItem.type}`);
    console.log(`📖 Title: ${contentItem.title}`);
    if (contentItem.note) {
      console.log(`📝 Note: ${contentItem.note}`);
    }
    console.log('');
    console.log('🌐 Your content is now available on your notecards dashboard!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

async function generateScreenshot(url) {
  const fetch = (await import('node-fetch')).default;
  
  const response = await fetch('http://localhost:3000/api/generate-screenshot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Screenshot API error: ${response.statusText}`);
  }

  return await response.json();
}

// Handle errors gracefully
process.on('uncaughtException', (error) => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled promise rejection:', error.message);
  process.exit(1);
});

main(); 
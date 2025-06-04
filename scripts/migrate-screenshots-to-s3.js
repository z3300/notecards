#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

async function migrateScreenshotsToS3() {
  try {
    console.log('🚀 Starting screenshot migration to S3...\n');

    // Check if required environment variables are set
    if (!process.env.AWS_REGION || !process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !S3_BUCKET_NAME) {
      console.error('❌ Missing required environment variables:');
      console.error('   - AWS_REGION');
      console.error('   - AWS_ACCESS_KEY_ID');
      console.error('   - AWS_SECRET_ACCESS_KEY');
      console.error('   - S3_BUCKET_NAME');
      console.error('\nPlease set these in your .env.local file.');
      process.exit(1);
    }

    // Get all content items with local screenshot paths
    console.log('📋 Finding content items with local screenshots...');
    const contentItems = await prisma.contentItem.findMany({
      where: {
        thumbnail: {
          startsWith: '/screenshots/', // Local screenshots start with /screenshots/
        },
      },
    });

    console.log(`📊 Found ${contentItems.length} items with local screenshots\n`);

    if (contentItems.length === 0) {
      console.log('✅ No local screenshots found to migrate. All done!');
      return;
    }

    const localScreenshotsDir = path.join(process.cwd(), 'public', 'screenshots');
    
    // Check if local screenshots directory exists
    if (!fs.existsSync(localScreenshotsDir)) {
      console.log('📁 Local screenshots directory not found. Creating...');
      fs.mkdirSync(localScreenshotsDir, { recursive: true });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Process each content item
    for (let i = 0; i < contentItems.length; i++) {
      const item = contentItems[i];
      const progress = `[${i + 1}/${contentItems.length}]`;
      
      try {
        console.log(`${progress} Processing: ${item.title.substring(0, 50)}...`);
        
        // Extract filename from thumbnail path (e.g., "/screenshots/filename.png" -> "filename.png")
        const filename = item.thumbnail.replace('/screenshots/', '');
        const localFilePath = path.join(localScreenshotsDir, filename);
        
        // Check if local file exists
        if (!fs.existsSync(localFilePath)) {
          console.log(`   ⚠️  Local file not found: ${filename} - Skipping`);
          errorCount++;
          errors.push({
            id: item.id,
            title: item.title,
            error: `Local file not found: ${filename}`
          });
          continue;
        }

        // Read the local file
        const fileBuffer = fs.readFileSync(localFilePath);
        
        // Generate S3 key (keep the same filename for consistency)
        const s3Key = `screenshots/${filename}`;
        
        // Upload to S3
        const putObjectCommand = new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: s3Key,
          Body: fileBuffer,
          ContentType: 'image/png',
        });

        await s3Client.send(putObjectCommand);
        
        // Construct S3 URL
        const s3ObjectUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
        
        // Update database record
        await prisma.contentItem.update({
          where: { id: item.id },
          data: { thumbnail: s3ObjectUrl },
        });

        console.log(`   ✅ Uploaded to S3: ${filename}`);
        console.log(`   🔗 New URL: ${s3ObjectUrl}`);
        successCount++;

      } catch (error) {
        console.log(`   ❌ Error processing ${item.thumbnail}:`, error.message);
        errorCount++;
        errors.push({
          id: item.id,
          title: item.title,
          error: error.message
        });
      }
      
      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${successCount} screenshots`);
    console.log(`❌ Failed: ${errorCount} screenshots`);
    console.log(`📈 Total processed: ${contentItems.length} items`);

    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error.title}: ${error.error}`);
      });
    }

    if (successCount > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('💡 Next steps:');
      console.log('   1. Verify the screenshots are accessible in your app');
      console.log('   2. Once confirmed, you can safely delete the local screenshots:');
      console.log(`      rm -rf ${localScreenshotsDir}`);
      console.log('   3. Remove the public/screenshots/ directory from .gitignore if needed');
    }

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateScreenshotsToS3().catch((error) => {
  console.error('💥 Unexpected error:', error);
  process.exit(1);
});

console.log('📱 Local Screenshots → S3 Migration Script');
console.log('=' .repeat(50)); 
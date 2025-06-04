# Screenshots S3 Migration Script

This script migrates existing local screenshots from your `public/screenshots/` directory to AWS S3 and updates the database records accordingly.

## Prerequisites

1. **AWS S3 Setup**: Ensure you have:
   - An AWS account
   - An S3 bucket created
   - AWS credentials (Access Key ID and Secret Access Key)
   - Proper IAM permissions for S3 uploads

2. **Environment Variables**: Set these in your `.env.local` file:
   ```
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   S3_BUCKET_NAME=your-screenshot-bucket-name
   ```

## Usage

### Method 1: Using npm script (Recommended)
```bash
npm run migrate-screenshots
```

### Method 2: Direct node execution
```bash
node scripts/migrate-screenshots-to-s3.js
```

## What the script does

1. **Scans Database**: Finds all `ContentItem` records with `thumbnail` paths starting with `/screenshots/`
2. **Validates Local Files**: Checks if the corresponding files exist in `public/screenshots/`
3. **Uploads to S3**: Uploads each screenshot to your S3 bucket in the `screenshots/` folder
4. **Updates Database**: Changes the thumbnail URL from local path to S3 URL
5. **Reports Results**: Shows detailed progress and summary

## Expected Output

```
📱 Local Screenshots → S3 Migration Script
==================================================
🚀 Starting screenshot migration to S3...

📋 Finding content items with local screenshots...
📊 Found 5 items with local screenshots

[1/5] Processing: How to Build a React App with TypeScript...
   ✅ Uploaded to S3: screenshot_abc123_1234567890.png
   🔗 New URL: https://your-bucket.s3.us-east-1.amazonaws.com/screenshots/screenshot_abc123_1234567890.png

[2/5] Processing: Understanding AWS S3 Storage...
   ✅ Uploaded to S3: screenshot_def456_1234567891.png
   🔗 New URL: https://your-bucket.s3.us-east-1.amazonaws.com/screenshots/screenshot_def456_1234567891.png

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Successfully migrated: 5 screenshots
❌ Failed: 0 screenshots
📈 Total processed: 5 items

🎉 Migration completed successfully!
💡 Next steps:
   1. Verify the screenshots are accessible in your app
   2. Once confirmed, you can safely delete the local screenshots:
      rm -rf /path/to/your/project/public/screenshots
   3. Remove the public/screenshots/ directory from .gitignore if needed
```

## Error Handling

The script handles common errors gracefully:
- **Missing local files**: Reports which files couldn't be found but continues
- **S3 upload failures**: Reports specific upload errors 
- **Database update failures**: Reports database connection or update issues
- **Missing environment variables**: Exits early with clear error message

## Safety Features

- **Non-destructive**: Original local files are not deleted automatically
- **Transaction-like**: Only updates database after successful S3 upload
- **Detailed logging**: Shows exactly what's happening at each step
- **Error tracking**: Collects and reports all errors at the end

## After Migration

1. **Test your app**: Verify screenshots load correctly from S3
2. **Check S3 bucket**: Confirm files are uploaded to your bucket
3. **Clean up local files**: Once confirmed working, delete `public/screenshots/`
4. **Update .gitignore**: Remove screenshot directory ignore if no longer needed

## Troubleshooting

**"Missing required environment variables"**
- Ensure all AWS variables are set in `.env.local`
- Check for typos in variable names

**"Local file not found"**
- Some database records may reference deleted screenshots
- These entries will be skipped with a warning

**"S3 upload failed"**
- Check AWS credentials and permissions
- Verify bucket name and region are correct
- Ensure bucket exists and is accessible

**"AccessControlListNotSupported"**
- Your S3 bucket has ACLs disabled (this is normal)
- The script doesn't use ACLs, so this error shouldn't occur

## Notes

- The script preserves original filenames for consistency
- S3 URLs follow the pattern: `https://BUCKET.s3.REGION.amazonaws.com/screenshots/FILENAME`
- Migration is idempotent - running it multiple times won't cause issues
- Only affects records with thumbnail paths starting with `/screenshots/` 
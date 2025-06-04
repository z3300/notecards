import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

interface ScreenshotResponse {
  success: boolean;
  screenshotPath?: string;
  error?: string;
}

// Initialize S3 Client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;

export async function POST(request: NextRequest): Promise<NextResponse<ScreenshotResponse>> {
  try {
    const { url } = await request.json();
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Check if S3 bucket is configured
    if (!S3_BUCKET_NAME) {
      console.error('S3_BUCKET_NAME is not defined in environment variables.');
      return NextResponse.json(
        { success: false, error: 'S3 bucket name not configured' },
        { status: 500 }
      );
    }

    // Generate unique filename based on URL and timestamp
    const urlHash = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const timestamp = Date.now();
    const filename = `screenshot_${urlHash}_${timestamp}.png`;
    const s3Key = `screenshots/${filename}`;

    // Generate screenshot using puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    let screenshotBuffer: Buffer;

    try {
      const page = await browser.newPage();
      
      // Set viewport for consistent screenshots
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1,
      });

      // Navigate to the URL
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      // Take screenshot and store in buffer
      screenshotBuffer = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 600 // Crop to get a thumbnail-like aspect ratio
        }
      }) as Buffer;

      await page.close();
    } finally {
      await browser.close();
    }

    // Upload to S3
    const putObjectCommand = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: screenshotBuffer,
      ContentType: 'image/png',
      // ACL: 'public-read', // Make images publicly accessible
    });

    await s3Client.send(putObjectCommand);

    // Construct the S3 URL
    const s3ObjectUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    return NextResponse.json({
      success: true,
      screenshotPath: s3ObjectUrl,
    });

  } catch (error) {
    console.error('Error generating or uploading screenshot:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate or upload screenshot' 
      },
      { status: 500 }
    );
  }
} 
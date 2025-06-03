import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import puppeteer from 'puppeteer';

interface ScreenshotResponse {
  success: boolean;
  screenshotPath?: string;
  error?: string;
}

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

    // Create screenshots directory if it doesn't exist
    const screenshotsDir = join(process.cwd(), 'public', 'screenshots');
    if (!existsSync(screenshotsDir)) {
      mkdirSync(screenshotsDir, { recursive: true });
    }

    // Generate unique filename based on URL and timestamp
    const urlHash = Buffer.from(url).toString('base64').replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
    const timestamp = Date.now();
    const filename = `screenshot_${urlHash}_${timestamp}.png`;
    const filepath = join(screenshotsDir, filename);

    // Generate screenshot using puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

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

      // Take screenshot
      const screenshot = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: 1200,
          height: 600 // Crop to get a thumbnail-like aspect ratio
        }
      });

      // Save screenshot to file
      writeFileSync(filepath, screenshot);

      await page.close();
    } finally {
      await browser.close();
    }

    // Return the relative path for use in the frontend
    const relativePath = `/screenshots/${filename}`;

    return NextResponse.json({
      success: true,
      screenshotPath: relativePath,
    });

  } catch (error) {
    console.error('Error generating screenshot:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate screenshot' 
      },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

interface MetadataResponse {
  success: boolean;
  data?: {
    type: string;
    title: string;
    author?: string;
    thumbnailUrl?: string;
    duration?: string;
    description?: string;
  };
  error?: string;
}

// YouTube API key would go here in production
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function extractYouTubeMetadata(url: string): Promise<any> {
  try {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    if (!videoId) throw new Error('Invalid YouTube URL');

    // If we have an API key, use YouTube API
    if (YOUTUBE_API_KEY) {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails`
      );
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const video = data.items[0];
        const duration = video.contentDetails.duration;
        // Convert ISO 8601 duration to human readable
        const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        let formattedDuration = '';
        if (match) {
          const hours = match[1] ? parseInt(match[1]) : 0;
          const minutes = match[2] ? parseInt(match[2]) : 0;
          const seconds = match[3] ? parseInt(match[3]) : 0;
          if (hours > 0) formattedDuration += `${hours}:`;
          formattedDuration += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        return {
          type: 'youtube',
          title: video.snippet.title,
          author: video.snippet.channelTitle,
          thumbnailUrl: video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url,
          duration: formattedDuration,
          description: video.snippet.description,
        };
      }
    }

    // Fallback to scraping the page
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    return {
      type: 'youtube',
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      author: $('meta[name="author"]').attr('content') || $('link[itemprop="name"]').attr('content'),
      thumbnailUrl: $('meta[property="og:image"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
    };
  } catch (error) {
    throw new Error(`Failed to extract YouTube metadata: ${error}`);
  }
}

async function extractRedditMetadata(url: string): Promise<any> {
  try {
    // Convert to JSON API URL
    const jsonUrl = url.includes('.json') ? url : `${url}.json`;
    
    const response = await fetch(jsonUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Reddit data');
    }
    
    const data = await response.json();
    
    if (data && data[0] && data[0].data && data[0].data.children && data[0].data.children[0]) {
      const post = data[0].data.children[0].data;
      return {
        type: 'reddit',
        title: post.title,
        author: `u/${post.author}`,
        thumbnailUrl: post.thumbnail && post.thumbnail !== 'self' ? post.thumbnail : undefined,
        description: post.selftext || post.url,
      };
    }
    
    throw new Error('Invalid Reddit post structure');
  } catch (error) {
    // Fallback to web scraping
    try {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);
      
      return {
        type: 'reddit',
        title: $('meta[property="og:title"]').attr('content') || $('title').text(),
        author: $('meta[name="author"]').attr('content'),
        thumbnailUrl: $('meta[property="og:image"]').attr('content'),
        description: $('meta[property="og:description"]').attr('content'),
      };
    } catch (fallbackError) {
      throw new Error(`Failed to extract Reddit metadata: ${error}`);
    }
  }
}

async function extractTwitterMetadata(url: string): Promise<any> {
  try {
    // For Twitter, we'll mainly use web scraping since the API requires authentication
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    return {
      type: 'twitter',
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      author: $('meta[name="twitter:creator"]').attr('content'),
      thumbnailUrl: $('meta[property="og:image"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
    };
  } catch (error) {
    throw new Error(`Failed to extract Twitter metadata: ${error}`);
  }
}

async function extractGenericMetadata(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Determine content type based on URL or meta tags
    let type = 'article';
    if (url.includes('spotify.com')) type = 'spotify';
    else if (url.includes('soundcloud.com')) type = 'soundcloud';
    
    return {
      type,
      title: $('meta[property="og:title"]').attr('content') || $('title').text() || 'Untitled',
      author: $('meta[name="author"]').attr('content') || $('meta[property="article:author"]').attr('content'),
      thumbnailUrl: $('meta[property="og:image"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
    };
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${error}`);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<MetadataResponse>> {
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

    let metadata;

    // Determine URL type and extract metadata accordingly
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      metadata = await extractYouTubeMetadata(url);
    } else if (url.includes('reddit.com')) {
      metadata = await extractRedditMetadata(url);
    } else if (url.includes('twitter.com') || url.includes('x.com')) {
      metadata = await extractTwitterMetadata(url);
    } else {
      metadata = await extractGenericMetadata(url);
    }

    // Clean up the data
    const cleanedMetadata = {
      ...metadata,
      title: metadata.title?.trim() || 'Untitled',
      author: metadata.author?.trim(),
      description: metadata.description?.trim(),
    };

    return NextResponse.json({
      success: true,
      data: cleanedMetadata,
    });

  } catch (error) {
    console.error('Error extracting metadata:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to extract metadata' 
      },
      { status: 500 }
    );
  }
} 
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

export async function extractYouTubeMetadata(url: string): Promise<any> {
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

export async function extractRedditMetadata(url: string): Promise<any> {
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
      
      // Extract basic post information
      let title = post.title || 'Untitled';
      let author = post.author;
      let subreddit = post.subreddit;
      let score = post.score || 0;
      let numComments = post.num_comments || 0;
      let description = post.selftext || '';
      let thumbnailUrl = post.thumbnail;
      
      // Clean up title - Reddit titles can have extra formatting
      title = title.trim();
      
      // Format author name with consistent prefix
      if (author && author !== '[deleted]') {
        author = author.startsWith('u/') ? author : `u/${author}`;
      } else {
        author = '[deleted]';
      }
      
      // Format subreddit with prefix for display
      const subredditDisplay = subreddit ? `r/${subreddit}` : 'Unknown';
      
      // Handle thumbnail URL - Reddit returns special values
      if (thumbnailUrl && (thumbnailUrl === 'self' || thumbnailUrl === 'default' || thumbnailUrl === 'nsfw' || thumbnailUrl === 'spoiler')) {
        thumbnailUrl = undefined; // Use default icon instead
      }
      
      // Create description with post metadata
      let enhancedDescription = '';
      if (description && description.trim()) {
        // Truncate long self-text
        enhancedDescription = description.length > 200 
          ? description.substring(0, 200) + '...' 
          : description;
      } else {
        // If no self-text, create description from post stats
        enhancedDescription = `${score} points • ${numComments} comments in ${subredditDisplay}`;
      }
      
      // Extract post creation time for potential use
      const createdUtc = post.created_utc;
      let timeInfo = '';
      if (createdUtc) {
        const postDate = new Date(createdUtc * 1000);
        const now = new Date();
        const hoursDiff = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
        
        if (hoursDiff < 24) {
          timeInfo = `${hoursDiff}h ago`;
        } else {
          const daysDiff = Math.floor(hoursDiff / 24);
          timeInfo = `${daysDiff}d ago`;
        }
      }
      
      // Enhance description with timing if available
      if (timeInfo && !description.trim()) {
        enhancedDescription = `${score} points • ${numComments} comments • ${timeInfo} in ${subredditDisplay}`;
      }
      
      return {
        type: 'reddit',
        title: title,
        author: author,
        thumbnailUrl: thumbnailUrl,
        description: enhancedDescription,
        // Store additional Reddit-specific data that could be useful
        metadata: {
          subreddit: subreddit,
          score: score,
          numComments: numComments,
          isNsfw: post.over_18 || false,
          postType: post.is_self ? 'text' : 'link',
          createdUtc: createdUtc,
          permalink: post.permalink,
          url: post.url
        }
      };
    }
    
    throw new Error('Invalid Reddit post structure');
  } catch (error) {
    // Fallback to web scraping
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
        },
      });
      const html = await response.text();
      const $ = cheerio.load(html);
      
      // Extract Open Graph metadata
      let title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Reddit Post';
      let description = $('meta[property="og:description"]').attr('content') || '';
      let thumbnailUrl = $('meta[property="og:image"]').attr('content');
      let author = $('meta[name="author"]').attr('content');
      
      // Try to extract subreddit from URL if not found in meta
      let subreddit = '';
      const subredditMatch = url.match(/\/r\/([^\/]+)/);
      if (subredditMatch) {
        subreddit = subredditMatch[1];
      }
      
      // Clean up title - Reddit web titles often include " : subreddit"
      if (title.includes(' : ') && subreddit) {
        title = title.split(' : ')[0].trim();
      }
      
      // Extract score and comment info from description if available
      let score = 0;
      let numComments = 0;
      
      // Reddit descriptions often contain "X points, Y comments"
      const scoreMatch = description.match(/(\d+)\s+point/i);
      const commentMatch = description.match(/(\d+)\s+comment/i);
      
      if (scoreMatch) score = parseInt(scoreMatch[1]);
      if (commentMatch) numComments = parseInt(commentMatch[1]);
      
      // Format author
      if (author && !author.startsWith('u/')) {
        author = `u/${author}`;
      }
      
      // Clean up description - remove Reddit's standard suffix
      if (description.includes('Posted in the')) {
        description = description.split('Posted in the')[0].trim();
      }
      
      // Enhance description with subreddit info if available
      if (subreddit && (!description || description.length < 50)) {
        const subredditInfo = score > 0 || numComments > 0 
          ? `${score} points • ${numComments} comments in r/${subreddit}`
          : `Posted in r/${subreddit}`;
        description = description ? `${description} • ${subredditInfo}` : subredditInfo;
      }
      
      return {
        type: 'reddit',
        title: title || 'Reddit Post',
        author: author,
        thumbnailUrl: thumbnailUrl,
        description: description || 'A post from Reddit',
        metadata: {
          subreddit: subreddit,
          score: score,
          numComments: numComments,
          isNsfw: false, // Can't reliably determine from scraping
          postType: 'unknown',
          extractionMethod: 'scraping'
        }
      };
    } catch (fallbackError) {
      throw new Error(`Failed to extract Reddit metadata: ${error}`);
    }
  }
}

export async function extractTwitterMetadata(url: string): Promise<any> {
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

export async function extractSpotifyMetadata(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract basic Open Graph metadata
    let title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Untitled';
    let author = $('meta[property="og:description"]').attr('content');
    let thumbnailUrl = $('meta[property="og:image"]').attr('content');
    let description = $('meta[name="description"]').attr('content');
    
    // Parse Spotify-specific information from the title and description
    // Spotify titles often follow patterns like "Song Name - Artist Name" or "Album Name - Artist Name"
    if (title && title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length >= 2) {
        // For tracks: "Track Name - Artist Name"
        // For albums: "Album Name - Artist Name" 
        title = parts[0].trim();
        author = parts[1].trim();
      }
    }
    
    // Try to extract artist from description if not found in title
    if (!author && description) {
      // Look for patterns like "Listen to [Song] by [Artist]" or "Album by [Artist]"
      const artistMatch = description.match(/(?:by|from)\s+([^·,]+)/i);
      if (artistMatch) {
        author = artistMatch[1].trim();
      }
    }
    
    // Clean up author field - Spotify often includes extra info like "Artist · Album · Song · Year"
    if (author) {
      // Extract just the artist name (first part before ·)
      const cleanAuthor = author.split('·')[0].trim();
      if (cleanAuthor) {
        author = cleanAuthor;
      }
    }
    
    // Try to extract duration from various possible locations
    let duration = '';
    
    // Look for duration in meta tags (sometimes Spotify includes this)
    const durationMeta = $('meta[property="music:duration"]').attr('content') ||
                        $('meta[name="music:duration"]').attr('content');
    
    if (durationMeta) {
      // Convert seconds to MM:SS format
      const seconds = parseInt(durationMeta);
      if (!isNaN(seconds)) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        duration = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
      }
    }
    
    // If no duration meta tag, try to find it in JSON-LD structured data
    if (!duration) {
      const scriptTags = $('script[type="application/ld+json"]');
      scriptTags.each((_, script) => {
        try {
          const jsonData = JSON.parse($(script).html() || '{}');
          if (jsonData.duration) {
            duration = jsonData.duration;
          }
        } catch (e) {
          // Ignore JSON parsing errors
        }
      });
    }
    
    // Try to extract track information from Spotify's embedded data
    if (!duration || !author) {
      // Look for Spotify's internal data in script tags
      const spotifyDataScript = $('script').filter((_, script) => {
        const content = $(script).html() || '';
        return content.includes('Spotify.Entity') || content.includes('"duration_ms"');
      });
      
      if (spotifyDataScript.length > 0) {
        const scriptContent = spotifyDataScript.html() || '';
        
        // Try to extract duration_ms
        const durationMatch = scriptContent.match(/"duration_ms":(\d+)/);
        if (durationMatch && !duration) {
          const durationMs = parseInt(durationMatch[1]);
          const seconds = Math.floor(durationMs / 1000);
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = seconds % 60;
          duration = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
        
        // Try to extract artist names from JSON data
        if (!author) {
          const artistMatch = scriptContent.match(/"artists":\s*\[([^\]]+)\]/);
          if (artistMatch) {
            try {
              const artistsData = artistMatch[1];
              const nameMatch = artistsData.match(/"name":"([^"]+)"/);
              if (nameMatch) {
                author = nameMatch[1];
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    }
    
    return {
      type: 'spotify',
      title: title || 'Untitled',
      author: author || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      duration: duration || undefined,
      description: description || undefined,
    };
  } catch (error) {
    throw new Error(`Failed to extract Spotify metadata: ${error}`);
  }
}

export async function extractInstagramMetadata(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      type: 'instagram',
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      author:
        $('meta[property="instapp:owner_user_name"]').attr('content') ||
        $('meta[name="author"]').attr('content'),
      thumbnailUrl: $('meta[property="og:image"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
    };
  } catch (error) {
    throw new Error(`Failed to extract Instagram metadata: ${error}`);
  }
}

export async function extractPinterestMetadata(url: string): Promise<any> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      type: 'pinterest',
      title: $('meta[property="og:title"]').attr('content') || $('title').text(),
      author:
        $('meta[name="pinterestapp:ownername"]').attr('content') ||
        $('meta[name="author"]').attr('content'),
      thumbnailUrl: $('meta[property="og:image"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
    };
  } catch (error) {
    throw new Error(`Failed to extract Pinterest metadata: ${error}`);
  }
}

export async function extractGenericMetadata(url: string, generateScreenshot: boolean = true): Promise<any> {
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
    if (url.includes('soundcloud.com')) type = 'soundcloud';
    
    // First, try to get existing thumbnail from Open Graph or other meta tags
    let thumbnailUrl = $('meta[property="og:image"]').attr('content') ||
                      $('meta[name="twitter:image"]').attr('content') ||
                      $('meta[property="twitter:image"]').attr('content') ||
                      $('meta[name="image"]').attr('content') ||
                      $('link[rel="image_src"]').attr('href');
    
    // Generate screenshot for articles if requested, no existing thumbnail, and it's an article
    if (generateScreenshot && type === 'article' && !thumbnailUrl) {
      try {
        console.log('No existing thumbnail found, generating screenshot for:', url);
        // Call our screenshot API
        const screenshotResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-screenshot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        });
        
        if (screenshotResponse.ok) {
          const screenshotData = await screenshotResponse.json();
          if (screenshotData.success && screenshotData.screenshotPath) {
            thumbnailUrl = screenshotData.screenshotPath;
            console.log('Screenshot generated successfully:', screenshotData.screenshotPath);
          }
        }
      } catch (screenshotError) {
        console.warn('Failed to generate screenshot for article:', screenshotError);
        // Continue without screenshot - the original metadata extraction will still work
      }
    } else if (thumbnailUrl) {
      console.log('Using existing thumbnail from metadata:', thumbnailUrl);
    }
    
    return {
      type,
      title: $('meta[property="og:title"]').attr('content') || $('title').text() || 'Untitled',
      author: $('meta[name="author"]').attr('content') || $('meta[property="article:author"]').attr('content'),
      thumbnailUrl,
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
      metadata: {
        hasOriginalThumbnail: !!($('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content')),
        screenshotGenerated: thumbnailUrl && thumbnailUrl.includes('/screenshots/')
      }
    };
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${error}`);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<MetadataResponse>> {
  try {
    const { url, generateScreenshot = true } = await request.json();
    
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
    } else if (url.includes('spotify.com')) {
      metadata = await extractSpotifyMetadata(url);
    } else if (url.includes('instagram.com')) {
      metadata = await extractInstagramMetadata(url);
    } else if (url.includes('pinterest.com') || url.includes('pin.it')) {
      metadata = await extractPinterestMetadata(url);
    } else {
      metadata = await extractGenericMetadata(url, generateScreenshot);
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
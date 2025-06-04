const cheerio = require('cheerio');

// YouTube API key would go here in production
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

async function extractYouTubeMetadata(url) {
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

async function extractRedditMetadata(url) {
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
      
      let title = post.title || 'Untitled';
      let author = post.author;
      let subreddit = post.subreddit;
      let score = post.score || 0;
      let numComments = post.num_comments || 0;
      let description = post.selftext || '';
      let thumbnailUrl = post.thumbnail;
      
      title = title.trim();
      
      if (author && author !== '[deleted]') {
        author = author.startsWith('u/') ? author : `u/${author}`;
      } else {
        author = '[deleted]';
      }
      
      const subredditDisplay = subreddit ? `r/${subreddit}` : 'Unknown';
      
      if (thumbnailUrl && (thumbnailUrl === 'self' || thumbnailUrl === 'default' || thumbnailUrl === 'nsfw' || thumbnailUrl === 'spoiler')) {
        thumbnailUrl = undefined;
      }
      
      let enhancedDescription = '';
      if (description && description.trim()) {
        enhancedDescription = description.length > 200 
          ? description.substring(0, 200) + '...' 
          : description;
      } else {
        enhancedDescription = `${score} points • ${numComments} comments in ${subredditDisplay}`;
      }
      
      return {
        type: 'reddit',
        title: title,
        author: author,
        thumbnailUrl: thumbnailUrl,
        description: enhancedDescription,
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
      
      let title = $('meta[property="og:title"]').attr('content') || $('title').text() || 'Reddit Post';
      let description = $('meta[property="og:description"]').attr('content') || '';
      let thumbnailUrl = $('meta[property="og:image"]').attr('content');
      let author = $('meta[name="author"]').attr('content');
      
      return {
        type: 'reddit',
        title: title,
        author: author,
        thumbnailUrl: thumbnailUrl,
        description: description,
      };
    } catch (fallbackError) {
      throw new Error(`Failed to extract Reddit metadata: ${error}`);
    }
  }
}

async function extractTwitterMetadata(url) {
  try {
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
      author: $('meta[name="author"]').attr('content'),
      thumbnailUrl: $('meta[property="og:image"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content'),
    };
  } catch (error) {
    throw new Error(`Failed to extract Twitter metadata: ${error}`);
  }
}

async function extractSpotifyMetadata(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let title = $('meta[property="og:title"]').attr('content') || $('title').text();
    let author = $('meta[property="og:description"]').attr('content');
    let thumbnailUrl = $('meta[property="og:image"]').attr('content');
    let description = $('meta[property="og:description"]').attr('content');
    let duration;
    
    // Clean up author from description
    if (author && title) {
      const parts = author.split(' · ');
      if (parts.length > 1 && parts[0].toLowerCase() !== title.toLowerCase()) {
        author = parts[0];
      } else {
        author = undefined;
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

async function extractMovieMetadata(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let title, author, year, rating, thumbnailUrl, description, duration;

    // IMDb specific extraction
    if (url.includes('imdb.com')) {
      title = $('h1[data-testid="hero__pageTitle"] span').text() || 
              $('h1 .titlereference-title-display-name').text() ||
              $('h1').first().text();
      
      // Director as author for movies
      author = $('[data-testid="title-pc-principal-credit"] a').first().text() ||
               $('.credit_summary_item').find('a').first().text();
      
      // Release year
      const yearMatch = $('h1').text().match(/\((\d{4})\)/);
      year = yearMatch ? yearMatch[1] : null;
      
      // Rating
      rating = $('[data-testid="hero-rating-bar__aggregate-rating__score"] span').first().text() ||
               $('.ratingValue strong span').text();
      
      // Poster image
      thumbnailUrl = $('.ipc-media img').attr('src') ||
                     $('.poster img').attr('src');
      
      // Plot/Description
      description = $('[data-testid="plot-xs_to_m"] span').text() ||
                    $('.summary_text').text();
      
      // Runtime/Duration
      const runtimeElement = $('li[data-testid="title-techspec_runtime"]').text() ||
                             $('.subtext time').text();
      if (runtimeElement) {
        const durationMatch = runtimeElement.match(/(\d+)\s*(?:min|minutes?)/i);
        if (durationMatch) {
          const minutes = parseInt(durationMatch[1]);
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          duration = hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
        }
      }
    }
    // TMDb specific extraction
    else if (url.includes('themoviedb.org')) {
      title = $('h2 a').text() || $('.title h2').text();
      author = $('.people .crew .profile a h3').first().text();
      
      const yearElement = $('.release_date').text() || $('.facts .release').text();
      if (yearElement) {
        const yearMatch = yearElement.match(/(\d{4})/);
        year = yearMatch ? yearMatch[1] : null;
      }
      
      rating = $('.user_score_chart').attr('data-percent') ||
               $('.rating .value').text();
      
      thumbnailUrl = $('.poster .image_content img').attr('src');
      if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
        thumbnailUrl = 'https://image.tmdb.org/t/p/w500' + thumbnailUrl;
      }
      
      description = $('.overview p').text();
      
      const runtimeElement = $('.facts .runtime').text();
      if (runtimeElement) {
        const durationMatch = runtimeElement.match(/(\d+)m/);
        if (durationMatch) {
          const minutes = parseInt(durationMatch[1]);
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = minutes % 60;
          duration = hours > 0 ? `${hours}h ${remainingMinutes}m` : `${minutes}m`;
        }
      }
    }
    // Letterboxd specific extraction
    else if (url.includes('letterboxd.com')) {
      title = $('h1.headline-1').text() || $('.film-title-wrapper h1').text();
      author = $('.directorlist a').first().text();
      
      const yearElement = $('.film-title-wrapper .metadata').text();
      if (yearElement) {
        const yearMatch = yearElement.match(/(\d{4})/);
        year = yearMatch ? yearMatch[1] : null;
      }
      
      rating = $('.average-rating .display-rating').text();
      thumbnailUrl = $('.film-poster img').attr('src');
      description = $('.review .body-text').first().text() || 
                   $('.truncate p').text();
    }
    // Generic movie page fallback
    else {
      title = $('meta[property="og:title"]').attr('content') || $('title').text();
      author = $('meta[name="director"]').attr('content') ||
               $('meta[property="video:director"]').attr('content');
      description = $('meta[property="og:description"]').attr('content');
      thumbnailUrl = $('meta[property="og:image"]').attr('content');
      
      // Try to extract year from title or meta
      const titleYear = title?.match(/\((\d{4})\)/);
      year = titleYear ? titleYear[1] : null;
    }

    // Format the final title with year
    const finalTitle = year && !title?.includes(year) ? `${title} (${year})` : title;
    
    // Format author for display
    const finalAuthor = author ? `Directed by ${author}` : author;

    return {
      type: 'movie',
      title: finalTitle || 'Untitled Movie',
      author: finalAuthor,
      thumbnailUrl,
      duration,
      description,
      metadata: {
        year,
        rating,
        director: author
      }
    };
  } catch (error) {
    throw new Error(`Failed to extract movie metadata: ${error}`);
  }
}

async function extractBookMetadata(url) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let title, author, rating, thumbnailUrl, description, pages, publishedYear;

    // Goodreads specific extraction
    if (url.includes('goodreads.com')) {
      title = $('h1[data-testid="bookTitle"]').text() ||
              $('.BookPageTitle h1').text() ||
              $('h1').first().text();
      
      author = $('[data-testid="name"]').first().text() ||
               $('.BookPageTitle .ContributorLink__name').text() ||
               $('.authorName span').text();
      
      rating = $('[data-testid="RatingStatistics__rating"]').text() ||
               $('.BookPageTitle .RatingStatistics__rating').text() ||
               $('.average').text();
      
      thumbnailUrl = $('[data-testid="coverImage"]').attr('src') ||
                     $('.BookPage__leftColumn img').attr('src') ||
                     $('.bookCover img').attr('src');
      
      description = $('[data-testid="description"]').text() ||
                   $('.BookPageTitle .DetailsLayoutRightParagraph').text() ||
                   $('#description span').text();
      
      // Extract page count
      const pagesElement = $('[data-testid="pagesFormat"]').text() ||
                           $('.BookPageTitle .FeaturedDetails').text() ||
                           $('.pages').text();
      if (pagesElement) {
        const pagesMatch = pagesElement.match(/(\d+)\s*pages?/i);
        pages = pagesMatch ? pagesMatch[1] : null;
      }
      
      // Extract publication year
      const publishElement = $('.BookPageTitle .FeaturedDetails').text() ||
                             $('.details .row').text();
      if (publishElement) {
        const yearMatch = publishElement.match(/(\d{4})/);
        publishedYear = yearMatch ? yearMatch[1] : null;
      }
    }
    // Google Books specific extraction
    else if (url.includes('books.google.com')) {
      title = $('#metadata_content_table .metadata_label').filter(':contains("Title")').next().text() ||
              $('.bookinfo h1').text();
      
      author = $('#metadata_content_table .metadata_label').filter(':contains("Author")').next().text() ||
               $('.bookinfo .authors a').text();
      
      thumbnailUrl = $('#coverImage').attr('src') ||
                     $('.cover img').attr('src');
      
      description = $('#synopsistext').text() ||
                   $('.description').text();
      
      // Extract page count
      const metadataRows = $('#metadata_content_table tr');
      metadataRows.each((_, row) => {
        const label = $(row).find('.metadata_label').text();
        const value = $(row).find('.metadata_value').text();
        if (label.includes('Pages')) {
          const pagesMatch = value.match(/(\d+)/);
          if (pagesMatch) pages = pagesMatch[1];
        }
        if (label.includes('Published')) {
          const yearMatch = value.match(/(\d{4})/);
          if (yearMatch) publishedYear = yearMatch[1];
        }
      });
    }
    // Amazon Books specific extraction
    else if (url.includes('amazon.com') && (url.includes('/dp/') || url.includes('/product/'))) {
      title = $('#productTitle').text() ||
              $('.product-title').text();
      
      author = $('.author .contributorNameID').text() ||
               $('.author a').first().text() ||
               $('#bylineInfo .author a').text();
      
      rating = $('.reviewCountTextLinkedHistogram .arp-rating-out-of-text').text() ||
               $('.a-icon-alt').text().match(/(\d+\.?\d*) out of/)?.[1];
      
      thumbnailUrl = $('#landingImage').attr('src') ||
                     $('.bookCover img').attr('src');
      
      description = $('#feature-bullets ul').text() ||
                   $('.productDescriptionWrapper').text();
      
      // Extract details from product details
      const detailsText = $('.detail-bullet-list').text() ||
                         $('#detailBullets').text();
      if (detailsText) {
        const pagesMatch = detailsText.match(/(\d+)\s*pages?/i);
        pages = pagesMatch ? pagesMatch[1] : null;
        
        const yearMatch = detailsText.match(/(\d{4})/);
        publishedYear = yearMatch ? yearMatch[1] : null;
      }
    }
    // Generic book page fallback
    else {
      title = $('meta[property="og:title"]').attr('content') || $('title').text();
      author = $('meta[name="author"]').attr('content') ||
               $('meta[property="book:author"]').attr('content');
      description = $('meta[property="og:description"]').attr('content');
      thumbnailUrl = $('meta[property="og:image"]').attr('content');
    }

    // Format author for display
    const finalAuthor = author ? `by ${author}` : author;
    
    // Add page count to duration field for consistency with other content types
    const duration = pages ? `${pages} pages` : undefined;

    return {
      type: 'book',
      title: title || 'Untitled Book',
      author: finalAuthor,
      thumbnailUrl,
      duration,
      description,
      metadata: {
        pages,
        publishedYear,
        rating,
        rawAuthor: author
      }
    };
  } catch (error) {
    throw new Error(`Failed to extract book metadata: ${error}`);
  }
}

async function extractGenericMetadata(url, generateScreenshot = true) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; URLMetadataBot/1.0)',
      },
    });
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    let type = 'article';
    if (url.includes('soundcloud.com')) type = 'soundcloud';
    
    let thumbnailUrl = $('meta[property="og:image"]').attr('content') ||
                      $('meta[name="twitter:image"]').attr('content') ||
                      $('meta[property="twitter:image"]').attr('content') ||
                      $('meta[name="image"]').attr('content') ||
                      $('link[rel="image_src"]').attr('href');
    
    return {
      type,
      title: $('meta[property="og:title"]').attr('content') || $('title').text() || 'Untitled',
      author: $('meta[name="author"]').attr('content') || $('meta[property="article:author"]').attr('content'),
      thumbnailUrl,
      description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content'),
    };
  } catch (error) {
    throw new Error(`Failed to extract metadata: ${error}`);
  }
}

async function extractMetadata(url, generateScreenshot = true) {
  try {
    // Validate URL format
    try {
      new URL(url);
    } catch {
      return { success: false, error: 'Invalid URL format' };
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
    } else if (url.includes('imdb.com') || url.includes('themoviedb.org') || url.includes('letterboxd.com')) {
      metadata = await extractMovieMetadata(url);
    } else if (url.includes('goodreads.com') || (url.includes('amazon.com') && (url.includes('/dp/') || url.includes('/product/'))) || url.includes('books.google.com')) {
      metadata = await extractBookMetadata(url);
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

    return {
      success: true,
      data: cleanedMetadata,
    };

  } catch (error) {
    console.error('Error extracting metadata:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to extract metadata' 
    };
  }
}

module.exports = { extractMetadata }; 
"use client";

import React, { useState } from 'react';
import { CARD_SIZES } from './cardSizes';


export interface ContentItem {
  id: string;
  type: 'youtube' | 'article' | 'reddit' | 'twitter' | 'spotify' | 'soundcloud' | 'movie' | 'book';
  url: string;
  title: string;
  note: string;
  createdAt: Date;
  thumbnail?: string | null;
  author?: string | null;
  duration?: string | null;
  location?: string | null;
}

interface ContentCardProps {
  content: ContentItem;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const [flipCount, setFlipCount] = useState(0);

  const getTypeColor = (type: string) => {
    const colors = {
      youtube: 'bg-red-500',
      article: 'bg-blue-500',
      reddit: 'bg-orange-500',
      twitter: 'bg-sky-500',
      spotify: 'bg-green-500',
      soundcloud: 'bg-orange-600',
      movie: 'bg-purple-500',
      book: 'bg-amber-500'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-500';
  };

  const getEmbedContent = () => {
    switch (content.type) {
      case 'youtube':
        const videoId = extractYouTubeId(content.url);
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-100 rounded-t-lg overflow-hidden border-b border-gray-200`}>
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title={content.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className={`${CARD_SIZES.iconText} ${CARD_SIZES.iconMargin}`}>▶️</div>
                  <span className={CARD_SIZES.metaText}>Video</span>
                </div>
              </div>
            )}
          </div>
        );
      case 'article':
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-50 rounded-t-lg overflow-hidden border-b border-gray-200`}>
            {content.thumbnail ? (
              <img 
                src={content.thumbnail} 
                alt={content.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to default icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center text-gray-600 ${content.thumbnail ? 'hidden' : ''}`}>
              <div className="text-center">
                <div className={`${CARD_SIZES.iconText} ${CARD_SIZES.iconMargin}`}>📄</div>
                <div className={CARD_SIZES.metaText}>Article</div>
              </div>
            </div>
          </div>
        );
      case 'reddit':
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-50 rounded-t-lg overflow-hidden border-b border-gray-200`}>
            {content.thumbnail ? (
              <img 
                src={content.thumbnail} 
                alt={content.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to default icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center text-gray-600 ${content.thumbnail ? 'hidden' : ''}`}>
              <div className="text-center">
                <div className={`${CARD_SIZES.iconText} ${CARD_SIZES.iconMargin}`}>💬</div>
                <div className={CARD_SIZES.metaText}>Reddit Post</div>
              </div>
            </div>
          </div>
        );
      case 'twitter':
        const tweetId = extractTweetId(content.url);
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-50 rounded-t-lg overflow-hidden border-b border-gray-200`}>
            {tweetId ? (
              <iframe
                src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light&chrome=nofooter,noborders&dnt=true`}
                className="w-full h-full"
                frameBorder="0"
                scrolling="no"
                title={content.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className={`${CARD_SIZES.iconText} ${CARD_SIZES.iconMargin}`}>🐦</div>
                  <span className={CARD_SIZES.metaText}>Tweet</span>
                </div>
              </div>
            )}
          </div>
        );
      case 'spotify': {
        const spotifyInfo = extractSpotifyInfo(content.url);
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-100 rounded-t-lg overflow-hidden border-b border-gray-200`}>
            {spotifyInfo ? (
              <iframe
                src={`https://open.spotify.com/embed/${spotifyInfo.type}/${spotifyInfo.id}`}
                className="w-full h-full"
                frameBorder="0"
                allow="encrypted-media"
                title={content.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className={`${CARD_SIZES.iconText} ${CARD_SIZES.iconMargin}`}>🎵</div>
                  <span className={CARD_SIZES.metaText}>Spotify</span>
                </div>
              </div>
            )}
          </div>
        );
      }
      case 'soundcloud': {
        const encodedUrl = encodeURIComponent(content.url);
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-100 rounded-t-lg overflow-hidden border-b border-gray-200`}>
            <iframe
              width="100%"
              height="100%"
              scrolling="no"
              frameBorder="no"
              allow="autoplay"
              src={`https://w.soundcloud.com/player/?url=${encodedUrl}&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&visual=true`}
              title={content.title}
            />
          </div>
        );
      }
      case 'movie':
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-50 rounded-t-lg overflow-hidden border-b border-gray-200`}>
            {content.thumbnail ? (
              <img 
                src={content.thumbnail} 
                alt={content.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to default icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center text-gray-600 ${content.thumbnail ? 'hidden' : ''}`}>
              <div className="text-center">
                <div className={`${CARD_SIZES.iconText} ${CARD_SIZES.iconMargin}`}>🎬</div>
                <div className={CARD_SIZES.metaText}>Movie</div>
              </div>
            </div>
          </div>
        );
      case 'book':
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-50 rounded-t-lg overflow-hidden border-b border-gray-200`}>
            {content.thumbnail ? (
              <img 
                src={content.thumbnail} 
                alt={content.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to default icon if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`w-full h-full flex items-center justify-center text-gray-600 ${content.thumbnail ? 'hidden' : ''}`}>
              <div className="text-center">
                <div className={`${CARD_SIZES.iconText} ${CARD_SIZES.iconMargin}`}>📚</div>
                <div className={CARD_SIZES.metaText}>Book</div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-50 rounded-t-lg flex items-center justify-center border-b border-gray-200`}>
            <span className={`text-gray-500 ${CARD_SIZES.metaText}`}>Unknown content</span>
          </div>
        );
    }
  };

  const getRotation = () => {
    return `rotateY(${flipCount * 180}deg)`;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if clicking on the link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    setFlipCount((prev) => prev + 1);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(content.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`perspective-1000 w-full ${CARD_SIZES.height}`}>
      <div 
        className={`relative w-full h-full transition-transform duration-700 ease-in-out preserve-3d cursor-pointer`}
        style={{ transform: getRotation() }}
        onClick={handleCardClick}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden">
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 h-full relative flex flex-col">
            {/* Color dot indicator */}            
            {getEmbedContent()}
            
            <div className={`${CARD_SIZES.padding} flex flex-col flex-1`}>
              {/* Top section with title and type */}
              <div className="flex-1">
                <div className="flex items-center justify-between w-full">
                  <h3 className={`font-medium text-gray-900 ${CARD_SIZES.titleText} ${CARD_SIZES.titleMargin} line-clamp-2 leading-snug`}>
                    {content.title}
                  </h3>
                  <div className={`${CARD_SIZES.dotSize} rounded-full ${getTypeColor(content.type)} ml-2 flex-shrink-0`}></div>
                </div>
                {content.author && (
                  <h3 className={`text-sm text-gray-800 mb-2`}>
                     {content.author}
                  </h3>
                )}
                <div className={`flex items-center justify-between ${CARD_SIZES.metaText} text-gray-500 mb-4`}>
                  <span className="capitalize">{content.type}</span>
                  {content.duration && <span>{content.duration}</span>}
                </div>
              </div>
              
              {/* Bottom section - properly structured */}
              <div className="flex flex-col space-y-3 pb-1">
                {/* Centered date and location */}
                <div className={`${CARD_SIZES.metaText} text-center`}>
                  <div className="font-semibold text-gray-600">{content.createdAt.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}</div>
                  <div className="text-gray-500 mt-1 font-normal">{content.createdAt.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}</div>
                  {content.location && (
                    <div className="text-gray-400 mt-1 font-normal">📍 {content.location}</div>
                  )}
                </div>
                
                {/* Action buttons row */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleLinkClick}
                    className={`${CARD_SIZES.metaText} text-blue-600 hover:text-blue-800 underline underline-offset-2 font-medium`}
                  >
                    Open Link →
                  </button>
                  <span className={`${CARD_SIZES.metaText} text-gray-400 font-normal`}>Click to flip</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Back of card */}
        <div className="absolute inset-0 backface-hidden rotate-y-180">
          <div className={`bg-gray-900 rounded-lg h-full ${CARD_SIZES.paddingBack} flex flex-col justify-center text-white relative`}>
            {/* Color dot indicator */}
            <div className={`absolute top-3 right-3 ${CARD_SIZES.dotSize} rounded-full ${getTypeColor(content.type)}`}></div>
            
            <div className="text-center">
              {/* <div className={`text-2xl ${CARD_SIZES.noteMargin}`}>📝</div>
              <h3 className={`font-medium ${CARD_SIZES.noteTitle} ${CARD_SIZES.noteMargin} text-gray-100`}>Notes</h3> */}
              <p className={`${CARD_SIZES.noteText} leading-relaxed text-gray-100`}>
                {content.note || "No notes added yet."}
              </p>
            </div>
            
            <div className="absolute bottom-4 right-4">
              {/* <span className={`${CARD_SIZES.metaText} text-gray-500`}>Click to flip back</span> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to extract YouTube video ID
const extractYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Helper function to extract Twitter/X tweet ID
const extractTweetId = (url: string): string | null => {
  // Matches both twitter.com and x.com URLs
  const regex = /(?:twitter\.com|x\.com)\/\w+\/status\/(\d+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Helper to extract Spotify type and ID
const extractSpotifyInfo = (url: string): { type: string; id: string } | null => {
  const regex = /open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)(?:\S*)?/;
  const match = url.match(regex);
  return match ? { type: match[1], id: match[2] } : null;
};

export default ContentCard; 
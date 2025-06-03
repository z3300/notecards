"use client";

import React, { useState } from 'react';

// 🎯 CARD SIZE CONFIGURATION - Easy to adjust!
// const CARD_SIZES = {
//   // Card dimensions
//   height: 'h-80',        // Total card height (320px) - MAIN SIZE CONTROL
//   embedHeight: 'h-48',   // Embed area height (192px) - About 60% of total
  
//   // Spacing & padding
//   padding: 'p-4',        // Content padding (16px)
//   paddingBack: 'p-6',    // Back card padding (24px)
  
//   // Elements
//   dotSize: 'w-3 h-3',    // Color dot size (12px)
  
//   // Typography (scales with card size)
//   titleText: 'text-sm',     // Title font size
//   metaText: 'text-xs',      // Meta info font size
//   iconText: 'text-3xl',     // Content type icons
//   noteTitle: 'text-lg',     // Notes title on back
//   noteText: 'text-sm',      // Notes content
  
//   // Spacing
//   titleMargin: 'mb-2',      // Title bottom margin
//   iconMargin: 'mb-2',       // Icon bottom margin
//   noteMargin: 'mb-4',       // Notes title margin
// } as const;

// 🔧 Quick size presets - uncomment one to use
// Small cards:
// const CARD_SIZES = { height: 'h-64', embedHeight: 'h-32', padding: 'p-3', paddingBack: 'p-4', dotSize: 'w-2 h-2', titleText: 'text-xs', metaText: 'text-xs', iconText: 'text-2xl', noteTitle: 'text-base', noteText: 'text-xs', titleMargin: 'mb-1', iconMargin: 'mb-1', noteMargin: 'mb-3' };

// Large cards:
 const CARD_SIZES = { height: 'h-96', embedHeight: 'h-56', padding: 'p-5', paddingBack: 'p-8', dotSize: 'w-4 h-4', titleText: 'text-base', metaText: 'text-sm', iconText: 'text-4xl', noteTitle: 'text-xl', noteText: 'text-base', titleMargin: 'mb-3', iconMargin: 'mb-3', noteMargin: 'mb-6' };

// Extra Large cards:
// const CARD_SIZES = { height: 'h-[28rem]', embedHeight: 'h-64', padding: 'p-6', paddingBack: 'p-10', dotSize: 'w-5 h-5', titleText: 'text-lg', metaText: 'text-base', iconText: 'text-5xl', noteTitle: 'text-2xl', noteText: 'text-lg', titleMargin: 'mb-4', iconMargin: 'mb-4', noteMargin: 'mb-8' };

export interface ContentItem {
  id: string;
  type: 'youtube' | 'article' | 'reddit' | 'twitter' | 'spotify' | 'soundcloud';
  url: string;
  title: string;
  note: string;
  createdAt: Date;
  thumbnail?: string;
  author?: string;
  duration?: string;
  location?: string;
}

interface ContentCardProps {
  content: ContentItem;
}

const ContentCard: React.FC<ContentCardProps> = ({ content }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const getTypeColor = (type: string) => {
    const colors = {
      youtube: 'bg-red-500',
      article: 'bg-blue-500',
      reddit: 'bg-orange-500',
      twitter: 'bg-sky-500',
      spotify: 'bg-green-500',
      soundcloud: 'bg-orange-600'
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
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-50 rounded-t-lg flex items-center justify-center border-b border-gray-200`}>
            <div className="text-center text-gray-600">
              <div className={`${CARD_SIZES.iconText} ${CARD_SIZES.iconMargin}`}>📄</div>
              <div className={CARD_SIZES.metaText}>Article</div>
            </div>
          </div>
        );
      case 'reddit':
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-50 rounded-t-lg flex items-center justify-center border-b border-gray-200`}>
            <div className="text-center text-gray-600">
              <div className={`${CARD_SIZES.iconText} ${CARD_SIZES.iconMargin}`}>💬</div>
              <div className={CARD_SIZES.metaText}>Reddit Post</div>
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
      default:
        return (
          <div className={`w-full ${CARD_SIZES.embedHeight} bg-gray-50 rounded-t-lg flex items-center justify-center border-b border-gray-200`}>
            <span className={`text-gray-500 ${CARD_SIZES.metaText}`}>Unknown content</span>
          </div>
        );
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't flip if clicking on the link
    if ((e.target as HTMLElement).closest('a')) {
      return;
    }
    setIsFlipped(!isFlipped);
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(content.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`perspective-1000 w-full ${CARD_SIZES.height}`}>
      <div 
        className={`relative w-full h-full transition-transform duration-700 ease-in-out preserve-3d cursor-pointer ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        onClick={handleCardClick}
      >
        {/* Front of card */}
        <div className="absolute inset-0 backface-hidden">
          <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 h-full relative flex flex-col">
            {/* Color dot indicator */}
            <div className={`absolute top-3 right-3 ${CARD_SIZES.dotSize} rounded-full ${getTypeColor(content.type)} z-10`}></div>
            
            {getEmbedContent()}
            
            <div className={`${CARD_SIZES.padding} flex flex-col flex-1`}>
              {/* Top section with title and type */}
              <div className="flex-1">
                <h3 className={`font-medium text-gray-900 ${CARD_SIZES.titleText} ${CARD_SIZES.titleMargin} line-clamp-2 leading-snug`}>
                  {content.title}
                </h3>
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
              <span className={`${CARD_SIZES.metaText} text-gray-500`}>Click to flip back</span>
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
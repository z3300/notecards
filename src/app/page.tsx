"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ContentCardSkeleton from '@/components/ContentCardSkeleton';
import { trpc } from '@/utils/trpc';

const ContentCard = dynamic(() => import('@/components/ContentCard'), {
  loading: () => <ContentCardSkeleton />,
});

export default function Dashboard() {
  const { data: items = [], isLoading } = trpc.content.getAll.useQuery();
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showStats, setShowStats] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Sort content by date (newest first)
  const sortedContent = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  // Search function that looks through multiple fields
  const searchContent = (content: any, query: string) => {
    if (!query.trim()) return true;
    
    const searchTerm = query.toLowerCase();
    const searchableFields = [
      content.title,
      content.author,
      content.note,
      content.type,
      content.location,
      content.url
    ];
    
    return searchableFields.some(field => 
      field && field.toString().toLowerCase().includes(searchTerm)
    );
  };
  
  // Derive dynamic content types and stats
  const contentTypes = Array.from(new Set(items.map((item) => item.type)));
  const TYPE_ICONS: Record<string, string> = {
    youtube: '📹',
    article: '📄',
    reddit: '💬',
    twitter: '🐦',
    spotify: '🎵',
    soundcloud: '☁️',
    movie: '🎬',
    book: '📚'
  };
  
  // Apply both search and type filtering
  const filteredContent = sortedContent.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = searchContent(item, searchQuery);
    return matchesType && matchesSearch;
  });
  
  const stats = [
    { label: 'Total', value: filteredContent.length, icon: '📊' },
    ...contentTypes.map((type) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: filteredContent.filter((item) => item.type === type).length,
      icon: TYPE_ICONS[type] || '❓'
    }))
  ];

  // Get current filter display name
  const currentFilterLabel = filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-700">
                notecards
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Hoverable Stats Dropdown */}
              <div className="relative">
                <span 
                  className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                  onMouseEnter={() => setShowStats(true)}
                  onMouseLeave={() => setShowStats(false)}
                >
                  {filteredContent.length} items
                </span>
                
                <AnimatePresence>
                  {showStats && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[160px] z-10"
                      onMouseEnter={() => setShowStats(true)}
                      onMouseLeave={() => setShowStats(false)}
                    >
                      <div className="space-y-2">
                        {stats.map((stat, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05, duration: 0.15 }}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-xs">{stat.icon}</span>
                              <span className="text-gray-600">{stat.label}</span>
                            </div>
                            <span className="font-medium text-gray-900">{stat.value}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              

            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by title, author, notes, type, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent bg-gray-50 text-gray-900 placeholder-gray-500 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Filter Dropdown and Search Results Info */}
        <div className="flex justify-between items-center mb-4">
          {/* Search Results Info */}
          <div className="flex items-center space-x-2">
            {searchQuery && (
              <span className="text-sm text-gray-600">
                {filteredContent.length} result{filteredContent.length !== 1 ? 's' : ''} for "{searchQuery}"
              </span>
            )}
          </div>
          
          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-black font-medium">Filter:</span>
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center space-x-2 px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
              >
                <span className="text-black">{currentFilterLabel}</span>
                <motion.svg
                  animate={{ rotate: showFilterDropdown ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </button>

              <AnimatePresence>
                {showFilterDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px] z-10"
                  >
                    <button
                      onClick={() => {
                        setFilterType('all');
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        filterType === 'all' ? 'bg-gray-100 text-gray-900 font-medium' : 'text-black'
                      }`}
                    >
                      All
                    </button>
                    {contentTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setFilterType(type);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                          filterType === type ? 'bg-gray-100 text-gray-900 font-medium' : 'text-black'
                        }`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Content Grid with smooth fade on filter change and minimal layout animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${filterType}-${searchQuery}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <ContentCardSkeleton key={i} />
                ))
              : filteredContent.map((content) => (
                  <motion.div key={content.id} layout>
                    <ContentCard content={content} />
                  </motion.div>
                ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State for Search Results */}
        {!isLoading && filteredContent.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 opacity-50">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              No content matches "{searchQuery}". Try adjusting your search terms or clear the search to see all content.
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Empty State (hidden when there's content) */}
        {items.length === 0 && !searchQuery && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 opacity-50">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Check back later for new content.
            </p>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-xs">
            vibe coded with ❤️ lol
          </div>
        </div>
      </footer>


    </div>
  );
}

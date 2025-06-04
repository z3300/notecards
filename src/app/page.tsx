"use client";

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import AddContentForm from '@/components/AddContentForm';
import ContentCardSkeleton from '@/components/ContentCardSkeleton';
import { trpc } from '@/utils/trpc';

const ContentCard = dynamic(() => import('@/components/ContentCard'), {
  loading: () => <ContentCardSkeleton />,
});

export default function Dashboard() {
  const { data: items = [], isLoading } = trpc.content.getAll.useQuery();
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  
  // Sort content by date (newest first)
  const sortedContent = [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  
  // Derive dynamic content types and stats
  const contentTypes = Array.from(new Set(items.map((item) => item.type)));
  const TYPE_ICONS: Record<string, string> = {
    youtube: '📹',
    article: '📄',
    reddit: '💬',
    twitter: '🐦',
    spotify: '🎵',
    soundcloud: '☁️'
  };
  const stats = [
    { label: 'Total', value: items.length, icon: '📊' },
    ...contentTypes.map((type) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: items.filter((item) => item.type === type).length,
      icon: TYPE_ICONS[type] || '❓'
    }))
  ];
  const filteredContent = sortedContent.filter(item => filterType === 'all' || item.type === filterType);

  // Get current filter display name
  const currentFilterLabel = filterType === 'all' ? 'All' : filterType.charAt(0).toUpperCase() + filterType.slice(1);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-700">
                my cards
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
                  {items.length} items
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
              
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Add Content
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-4 py-8">
        {/* Filter Dropdown */}
        <div className="flex justify-end mb-4">
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
            key={filterType}
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

        {/* Empty State (hidden when there's content) */}
        {items.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 opacity-50">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your personal content library by saving interesting links, videos, and articles.
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-md font-medium transition-colors"
            >
              Add Your First Item
            </button>
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

      {/* Add Content Modal */}
      <AddContentForm 
        isOpen={showAddForm} 
        onClose={() => setShowAddForm(false)} 
      />
    </div>
  );
}

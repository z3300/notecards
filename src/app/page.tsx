"use client";

import ContentCard from '@/components/ContentCard';
import { mockContent } from '@/data/mockContent';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export default function Dashboard() {
  // Sort content by date (newest first)
  const sortedContent = [...mockContent].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const [filterType, setFilterType] = useState<string>('all');
  // Derive dynamic content types and stats
  const contentTypes = Array.from(new Set(mockContent.map((item) => item.type)));
  const TYPE_ICONS: Record<string, string> = {
    youtube: '📹',
    article: '📄',
    reddit: '💬',
    twitter: '🐦',
    spotify: '🎵',
    soundcloud: '☁️'
  };
  const stats = [
    { label: 'Total', value: mockContent.length, icon: '📊' },
    ...contentTypes.map((type) => ({
      label: type.charAt(0).toUpperCase() + type.slice(1),
      value: mockContent.filter((item) => item.type === type).length,
      icon: TYPE_ICONS[type] || '❓'
    }))
  ];
  const filteredContent = sortedContent.filter(item => filterType === 'all' || item.type === filterType);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Content Dashboard
              </h1>
              <p className="mt-1 text-gray-600 text-sm">
                Your saved links, articles, and videos with personal notes
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {mockContent.length} items
              </span>
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Add Content
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto px-2 py-8">
        {/* Simple Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4">
              <div className="text-lg mb-1">{stat.icon}</div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Filter Dropdown */}
        <div className="flex justify-end mb-4">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm bg-black border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            <option value="all">All</option>
            {contentTypes.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
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
            {filteredContent.map((content) => (
              <motion.div key={content.id} layout>
                <ContentCard content={content} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty State (hidden when there's content) */}
        {mockContent.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-6 opacity-50">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No content yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your personal content library by saving interesting links, videos, and articles.
            </p>
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-md font-medium transition-colors">
              Add Your First Item
            </button>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-400 text-xs">
            Click cards to view notes • Click "Open Link" to visit content
          </div>
        </div>
      </footer>
    </div>
  );
}

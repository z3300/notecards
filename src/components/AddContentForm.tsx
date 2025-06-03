'use client';

import { useState } from 'react';
import { trpc } from '@/utils/trpc';
import { ContentType } from '@prisma/client';

interface AddContentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export default function AddContentForm({ isOpen, onClose }: AddContentFormProps) {
  const [step, setStep] = useState<'url' | 'form'>('url');
  const [urlInput, setUrlInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    type: 'article' as ContentType,
    url: '',
    title: '',
    note: '',
    author: '',
    duration: '',
    location: '',
  });

  const utils = trpc.useUtils();
  const createContent = trpc.content.create.useMutation({
    onSuccess: () => {
      utils.content.getAll.invalidate();
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setStep('url');
    setUrlInput('');
    setExtractionError(null);
    setFormData({
      type: 'article' as ContentType,
      url: '',
      title: '',
      note: '',
      author: '',
      duration: '',
      location: '',
    });
  };

  const extractMetadata = async () => {
    if (!urlInput.trim()) return;
    
    setIsExtracting(true);
    setExtractionError(null);
    
    try {
      const response = await fetch('/api/extract-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlInput.trim() }),
      });
      
      const result: MetadataResponse = await response.json();
      
      if (result.success && result.data) {
        setFormData({
          type: result.data.type as ContentType,
          url: urlInput.trim(),
          title: result.data.title,
          note: '',
          author: result.data.author || '',
          duration: result.data.duration || '',
          location: '',
        });
        setStep('form');
      } else {
        setExtractionError(result.error || 'Failed to extract metadata');
      }
    } catch (error) {
      setExtractionError('Failed to extract metadata. Please try again.');
      console.error('Extraction error:', error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContent.mutate({
      type: formData.type,
      url: formData.url,
      title: formData.title,
      note: formData.note,
      author: formData.author || undefined,
      duration: formData.duration || undefined,
      location: formData.location || undefined,
    });
  };

  const handleManualEntry = () => {
    setFormData(prev => ({ ...prev, url: urlInput.trim() }));
    setStep('form');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4"
         style={{
           background: 'rgba(30, 41, 59, 0.25)',
           backdropFilter: 'blur(5px) saturate(100%)',
           WebkitBackdropFilter: 'blur(5px) saturate(100%)'
         }}>
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {step === 'url' ? 'Paste Content URL' : 'Add New Content'}
            </h2>
            <button
              onClick={() => { onClose(); resetForm(); }}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {step === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste your URL here
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  We'll automatically extract the title, author, and other details for you.
                </p>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  autoFocus
                />
              </div>

              {extractionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{extractionError}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleManualEntry}
                  disabled={!urlInput.trim() || isExtracting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Enter Manually
                </button>
                <button
                  type="button"
                  onClick={extractMetadata}
                  disabled={!urlInput.trim() || isExtracting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isExtracting ? 'Extracting...' : 'Auto-Fill'}
                </button>
              </div>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  type="button"
                  onClick={() => setStep('url')}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ← Change URL
                </button>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  Auto-filled
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ContentType })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                >
                  <option value="article">Article</option>
                  <option value="youtube">YouTube</option>
                  <option value="reddit">Reddit</option>
                  <option value="twitter">Twitter</option>
                  <option value="spotify">Spotify</option>
                  <option value="soundcloud">SoundCloud</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL *
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-black"
                  required
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Add your personal notes here..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 5:30"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Where you saved this"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { onClose(); resetForm(); }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createContent.isPending}
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {createContent.isPending ? 'Adding...' : 'Add Content'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 
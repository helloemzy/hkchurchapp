'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useAuthContext } from '../../lib/auth/auth-context';
import { Database } from '../../lib/supabase/database.types';

type BibleBookmark = Database['public']['Tables']['bible_bookmarks']['Row'];

interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  text_zh?: string;
}

interface BibleReaderProps {
  initialBook?: string;
  initialChapter?: number;
  language?: 'en' | 'zh';
  className?: string;
}

const BIBLE_BOOKS = [
  // Old Testament
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Song of Songs', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk',
  'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  
  // New Testament
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans',
  '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
  'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John',
  'Jude', 'Revelation'
];

const HIGHLIGHT_COLORS = [
  { name: 'Purple', color: '#7C3AED', bg: 'bg-purple-100' },
  { name: 'Yellow', color: '#F59E0B', bg: 'bg-yellow-100' },
  { name: 'Green', color: '#10B981', bg: 'bg-green-100' },
  { name: 'Blue', color: '#3B82F6', bg: 'bg-blue-100' },
  { name: 'Pink', color: '#EC4899', bg: 'bg-pink-100' },
  { name: 'Orange', color: '#F97316', bg: 'bg-orange-100' },
];

export const BibleReader: React.FC<BibleReaderProps> = ({
  initialBook = 'Psalms',
  initialChapter = 23,
  language = 'en',
  className = '',
}) => {
  const [currentBook, setCurrentBook] = useState(initialBook);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [bookmarks, setBookmarks] = useState<BibleBookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0]);
  const [maxChapters, setMaxChapters] = useState(150); // Default for Psalms

  const { user } = useAuthContext();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChapterContent();
  }, [currentBook, currentChapter, language]);

  useEffect(() => {
    if (user) {
      fetchBookmarks();
    }
  }, [currentBook, currentChapter, user]);

  const fetchChapterContent = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would call a Bible API
      // For now, we'll simulate with sample content
      const sampleVerses = generateSampleVerses(currentBook, currentChapter);
      setVerses(sampleVerses);
    } catch (error) {
      console.error('Error fetching Bible content:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookmarks = async () => {
    try {
      const response = await fetch(`/api/bible/bookmarks?book=${currentBook}&chapter=${currentChapter}`);
      
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
    }
  };

  const generateSampleVerses = (book: string, chapter: number): Verse[] => {
    // Sample content for demonstration
    if (book === 'Psalms' && chapter === 23) {
      return [
        {
          book: 'Psalms',
          chapter: 23,
          verse: 1,
          text: 'The Lord is my shepherd, I lack nothing.',
          text_zh: '耶和華是我的牧者，我必不致缺乏。'
        },
        {
          book: 'Psalms',
          chapter: 23,
          verse: 2,
          text: 'He makes me lie down in green pastures, he leads me beside quiet waters,',
          text_zh: '他使我躺臥在青草地上，領我在可安歇的水邊。'
        },
        {
          book: 'Psalms',
          chapter: 23,
          verse: 3,
          text: 'he refreshes my soul. He guides me along the right paths for his name\'s sake.',
          text_zh: '他使我的靈魂甦醒，為自己的名引導我走義路。'
        },
        {
          book: 'Psalms',
          chapter: 23,
          verse: 4,
          text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.',
          text_zh: '我雖然行過死蔭的幽谷，也不怕遭害，因為你與我同在；你的杖，你的竿，都安慰我。'
        },
        {
          book: 'Psalms',
          chapter: 23,
          verse: 5,
          text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.',
          text_zh: '在我敵人面前，你為我擺設筵席；你用油膏了我的頭，使我的福杯滿溢。'
        },
        {
          book: 'Psalms',
          chapter: 23,
          verse: 6,
          text: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.',
          text_zh: '我一生一世必有恩惠慈愛隨著我；我且要住在耶和華的殿中，直到永遠。'
        }
      ];
    }

    // Generate placeholder verses for other chapters
    const verseCount = Math.floor(Math.random() * 20) + 5;
    return Array.from({ length: verseCount }, (_, i) => ({
      book,
      chapter,
      verse: i + 1,
      text: `This is verse ${i + 1} of ${book} chapter ${chapter}. In a real implementation, this would contain the actual Bible text from a reliable source.`,
      text_zh: `這是${book}第${chapter}章第${i + 1}節。在實際實現中，這將包含來自可靠來源的實際聖經文本。`
    }));
  };

  const isVerseBookmarked = (verse: number) => {
    return bookmarks.some(bookmark => 
      bookmark.book === currentBook && 
      bookmark.chapter === currentChapter && 
      bookmark.verse === verse
    );
  };

  const getVerseBookmark = (verse: number) => {
    return bookmarks.find(bookmark => 
      bookmark.book === currentBook && 
      bookmark.chapter === currentChapter && 
      bookmark.verse === verse
    );
  };

  const handleVerseClick = (verse: Verse) => {
    if (!user) return;
    
    setSelectedVerse(verse);
    const existingBookmark = getVerseBookmark(verse.verse);
    if (existingBookmark) {
      setNotes(existingBookmark.notes || '');
      const color = HIGHLIGHT_COLORS.find(c => c.color === existingBookmark.color) || HIGHLIGHT_COLORS[0];
      setSelectedColor(color);
    } else {
      setNotes('');
      setSelectedColor(HIGHLIGHT_COLORS[0]);
    }
    setShowBookmarkModal(true);
  };

  const saveBookmark = async () => {
    if (!selectedVerse || !user) return;

    try {
      const bookmarkData = {
        book: selectedVerse.book,
        chapter: selectedVerse.chapter,
        verse: selectedVerse.verse,
        verse_text: selectedVerse.text,
        verse_text_zh: selectedVerse.text_zh || null,
        notes: notes.trim() || null,
        color: selectedColor.color,
      };

      const response = await fetch('/api/bible/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookmarkData),
      });

      if (response.ok) {
        fetchBookmarks(); // Refresh bookmarks
        setShowBookmarkModal(false);
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const deleteBookmark = async (bookmarkId: string) => {
    try {
      const response = await fetch(`/api/bible/bookmarks?id=${bookmarkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchBookmarks(); // Refresh bookmarks
        setShowBookmarkModal(false);
      }
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const navigateChapter = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else if (direction === 'next' && currentChapter < maxChapters) {
      setCurrentChapter(currentChapter + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {/* Navigation Header */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <select
              value={currentBook}
              onChange={(e) => setCurrentBook(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {BIBLE_BOOKS.map(book => (
                <option key={book} value={book}>{book}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigateChapter('prev')}
                disabled={currentChapter <= 1}
              >
                ← Prev
              </Button>
              
              <input
                type="number"
                value={currentChapter}
                onChange={(e) => setCurrentChapter(parseInt(e.target.value) || 1)}
                min="1"
                max={maxChapters}
                className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigateChapter('next')}
                disabled={currentChapter >= maxChapters}
              >
                Next →
              </Button>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {language === 'zh' ? '繁體中文' : 'English'}
          </div>
        </div>
      </Card>

      {/* Chapter Content */}
      <Card className="p-6 mb-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            {currentBook} {currentChapter}
          </h1>
        </div>

        <div className="space-y-4">
          {verses.map((verse) => {
            const bookmark = getVerseBookmark(verse.verse);
            const isBookmarked = Boolean(bookmark);
            
            return (
              <div
                key={verse.verse}
                className={`group relative p-4 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                  isBookmarked ? 'border-l-4' : ''
                }`}
                style={isBookmarked ? { borderLeftColor: bookmark?.color } : {}}
                onClick={() => handleVerseClick(verse)}
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">
                    {verse.verse}
                  </span>
                  
                  <div className="flex-1">
                    <p className="text-gray-800 leading-relaxed font-mono text-lg">
                      {language === 'zh' && verse.text_zh ? verse.text_zh : verse.text}
                    </p>
                    
                    {bookmark?.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
                        <strong>Note:</strong> {bookmark.notes}
                      </div>
                    )}
                  </div>

                  {user && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className={`text-xs px-2 py-1 rounded ${
                        isBookmarked ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isBookmarked ? '📌 Bookmarked' : '+ Bookmark'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Bookmark Modal */}
      {showBookmarkModal && selectedVerse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div
            ref={modalRef}
            className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto"
          >
            <h3 className="text-xl font-semibold mb-4">
              Bookmark {selectedVerse.book} {selectedVerse.chapter}:{selectedVerse.verse}
            </h3>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700 font-mono">
                "{language === 'zh' && selectedVerse.text_zh ? selectedVerse.text_zh : selectedVerse.text}"
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Highlight Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {HIGHLIGHT_COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor.color === color.color ? 'border-gray-400' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color.color }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personal Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your thoughts, insights, or prayers..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
              />
            </div>

            <div className="flex justify-between gap-3">
              <div>
                {getVerseBookmark(selectedVerse.verse) && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteBookmark(getVerseBookmark(selectedVerse.verse)!.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowBookmarkModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={saveBookmark}>
                  Save Bookmark
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!user && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-700 text-center">
            <strong>Sign in</strong> to bookmark verses and add personal notes
          </p>
        </Card>
      )}
    </div>
  );
};
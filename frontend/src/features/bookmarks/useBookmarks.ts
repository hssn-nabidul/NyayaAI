'use client';

import { useState, useEffect } from 'react';

export interface Bookmark {
  doc_id: string;
  title: string;
  court: string;
  date: string;
  citation?: string;
  bookmarked_at: string;
}

export const useBookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('nyaya_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  const saveToStorage = (newBookmarks: Bookmark[]): void => {
    setBookmarks(newBookmarks);
    localStorage.setItem('nyaya_bookmarks', JSON.stringify(newBookmarks));
  };

  const toggleBookmark = (item: Omit<Bookmark, 'bookmarked_at'>): boolean => {
    const exists = bookmarks.find(b => b.doc_id === item.doc_id);
    if (exists) {
      const filtered = bookmarks.filter(b => b.doc_id !== item.doc_id);
      saveToStorage(filtered);
      return false;
    } else {
      const newList = [
        { ...item, bookmarked_at: new Date().toISOString() } as Bookmark,
        ...bookmarks
      ];
      saveToStorage(newList);
      return true;
    }
  };

  const isBookmarked = (docId: string): boolean => {
    return bookmarks.some(b => b.doc_id === docId);
  };

  const removeBookmark = (docId: string): void => {
    const filtered = bookmarks.filter(b => b.doc_id !== docId);
    saveToStorage(filtered);
  };

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    removeBookmark
  };
};

/**
 * Phase 1: LocalStorage fallback for Firestore
 * All bookmarks and notes are stored locally in the browser.
 */

export interface Bookmark {
  docId: string;
  title: string;
  court: string;
  date: string;
  savedAt: string;
  note?: string;
}

const STORAGE_KEYS = {
  BOOKMARKS: 'nyaya_bookmarks',
};

export const storage = {
  // Bookmarks
  getBookmarks: (): Bookmark[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return data ? JSON.parse(data) : [];
  },

  addBookmark: (bookmark: Bookmark) => {
    const bookmarks = storage.getBookmarks();
    if (!bookmarks.find(b => b.docId === bookmark.docId)) {
      const updated = [bookmark, ...bookmarks];
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
    }
  },

  removeBookmark: (docId: string) => {
    const bookmarks = storage.getBookmarks();
    const updated = bookmarks.filter(b => b.docId !== docId);
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  },

  updateNote: (docId: string, note: string) => {
    const bookmarks = storage.getBookmarks();
    const updated = bookmarks.map(b => 
      b.docId === docId ? { ...b, note } : b
    );
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(updated));
  },

  isBookmarked: (docId: string): boolean => {
    return !!storage.getBookmarks().find(b => b.docId === docId);
  }
};

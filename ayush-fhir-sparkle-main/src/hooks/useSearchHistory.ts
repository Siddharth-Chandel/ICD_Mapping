import { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  results?: any;
  type: 'search' | 'translation' | 'integration' | 'problem';
}

export const useSearchHistory = (type: HistoryItem['type'], maxItems: number = 10) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(`search-history-${type}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setHistory(parsed);
      } catch (error) {
        console.error('Error parsing history:', error);
      }
    }
  }, [type]);

  const addToHistory = (query: string, results?: any) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      query,
      timestamp: new Date(),
      results,
      type
    };

    setHistory(prev => {
      // Remove any existing item with the same query to avoid duplicates
      const filtered = prev.filter(item => item.query !== query);
      const updated = [newItem, ...filtered].slice(0, maxItems);
      localStorage.setItem(`search-history-${type}`, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(`search-history-${type}`);
  };

  const removeItem = (id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem(`search-history-${type}`, JSON.stringify(updated));
      return updated;
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeItem
  };
};

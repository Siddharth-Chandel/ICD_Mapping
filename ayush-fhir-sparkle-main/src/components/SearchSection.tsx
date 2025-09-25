import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Sparkles } from "lucide-react";

interface SearchSuggestion {
  label: string;
  namaste_code: string;
  confidence: number;
}

export const SearchSection = () => {
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState("");
  const [suggestResult, setSuggestResult] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Search API call
      const searchResponse = await fetch(`/search?q=${encodeURIComponent(query)}`);
      const searchData = await searchResponse.json();
      setSearchResult(JSON.stringify(searchData, null, 2));

      // Suggest API call
      const suggestResponse = await fetch(`/suggest?q=${encodeURIComponent(query)}`);
      const suggestData = await suggestResponse.json();
      setSuggestResult(JSON.stringify(suggestData, null, 2));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult('Error occurred during search');
      setSuggestResult('Error occurred during suggestion');
    } finally {
      setIsSearching(false);
    }
  };

  const handleTypeSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await fetch(`/suggest?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      const items = (data.suggestions || []).map((s: any) => ({
        label: s.label,
        namaste_code: s.namaste_code,
        confidence: s.confidence
      }));
      setSuggestions(items);
      setShowDropdown(items.length > 0);
    } catch (error) {
      console.error('Type search error:', error);
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    handleTypeSearch(value);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.label);
    setShowDropdown(false);
    handleSearch();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      setShowDropdown(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <Card className="section-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Search className="h-5 w-5 text-primary" />
          2) Search &amp; AI Suggest
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 items-start">
          <div className="relative flex-1" ref={dropdownRef}>
            <Input
              ref={inputRef}
              placeholder="Type Amlapitta / अम्लपित्त ..."
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input-field"
              autoComplete="off"
            />
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-64 overflow-auto z-50">
                <ul className="py-1">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-3 py-2 hover:bg-accent cursor-pointer flex justify-between items-center text-sm"
                    >
                      <span>
                        {suggestion.label}
                        <span className="text-muted-foreground text-xs ml-2">
                          ({suggestion.namaste_code})
                        </span>
                      </span>
                      <span className="text-primary text-xs font-semibold">
                        {suggestion.confidence}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="btn-secondary"
          >
            {isSearching ? "Searching..." : "Go"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Search Results</span>
            </div>
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto h-72 text-muted-foreground">
              {searchResult || 'Search results will appear here...'}
            </pre>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AI Suggestions</span>
            </div>
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto h-72 text-muted-foreground">
              {suggestResult || 'AI suggestions will appear here...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
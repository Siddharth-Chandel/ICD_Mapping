import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Sparkles, Zap, Brain } from "lucide-react";

interface SearchSuggestion {
  label: string;
  namaste_code: string;
  confidence: number;
}

interface ModernSearchSectionProps {
  onSearchComplete?: (query: string, results: any) => void;
  initialQuery?: string;
}

export const ModernSearchSection = ({ onSearchComplete, initialQuery = "" }: ModernSearchSectionProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [searchResult, setSearchResult] = useState("");
  const [suggestResult, setSuggestResult] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update query when initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

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

      // Call the completion callback
      if (onSearchComplete) {
        onSearchComplete(query, { search: searchData, suggest: suggestData });
      }
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
    <Card className="card-search backdrop-blur-sm border-0 shadow-glow rounded-3xl overflow-hidden">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-3 bg-gradient-secondary rounded-2xl shadow-glow">
            <Search className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-gradient">Step 2:</span> AI-Powered Search
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3 items-start">
          <div className="relative flex-1" ref={dropdownRef}>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Type Amlapitta / अम्लपित्त ..."
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-field pl-12 pr-4 py-4 text-base"
                autoComplete="off"
              />
              {isSearching && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <Sparkles className="h-5 w-5 text-primary animate-spin" />
                </div>
              )}
            </div>
            {showDropdown && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-card/95 backdrop-blur-lg border border-border/50 rounded-2xl shadow-xl max-h-64 overflow-auto z-50">
                <div className="p-2">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-4 py-3 hover:bg-primary/10 cursor-pointer rounded-xl flex justify-between items-center text-sm transition-colors duration-200"
                    >
                      <div>
                        <span className="font-medium text-card-foreground">{suggestion.label}</span>
                        <span className="text-muted-foreground text-xs ml-2 font-mono">
                          ({suggestion.namaste_code})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-primary text-xs font-semibold bg-primary/10 px-2 py-1 rounded-full">
                          {suggestion.confidence}%
                        </span>
                        <Brain className="h-3 w-3 text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button 
            onClick={handleSearch} 
            disabled={isSearching}
            className="btn-secondary px-8 py-4"
          >
            {isSearching ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Search
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-secondary" />
              <span className="text-base font-semibold">Search Results</span>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-secondary/20 rounded-2xl p-4 h-80 overflow-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {searchResult || 'Enter a search term above to see results here...'}
              </pre>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="text-base font-semibold">AI Suggestions</span>
            </div>
            <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-2xl p-4 h-80 overflow-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {suggestResult || 'AI-powered suggestions will appear here...'}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
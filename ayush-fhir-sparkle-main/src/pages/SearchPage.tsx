import { useState } from "react";
import { ModernSearchSection } from "@/components/ModernSearchSection";
import { SearchHistory } from "@/components/SearchHistory";
import { useSearchHistory } from "@/hooks/useSearchHistory";

const SearchPage = () => {
  const { history, addToHistory, clearHistory, removeItem } = useSearchHistory('search');
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSelect = (query: string) => {
    setSearchQuery(query);
  };

  const handleSearchComplete = (query: string, results: any) => {
    addToHistory(query, results);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Search</h1>
          <p className="text-muted-foreground">
            Search through medical terminology and get instant results
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ModernSearchSection 
              onSearchComplete={handleSearchComplete}
              initialQuery={searchQuery}
            />
          </div>
          
          <div className="lg:col-span-1">
            <SearchHistory
              history={history}
              onSelect={handleSearchSelect}
              onRemove={removeItem}
              onClear={clearHistory}
              title="Search History"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
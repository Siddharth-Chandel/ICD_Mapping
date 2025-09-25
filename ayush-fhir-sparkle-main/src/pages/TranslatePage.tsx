import { useState } from "react";
import { ModernTranslateSection } from "@/components/ModernTranslateSection";
import { SearchHistory } from "@/components/SearchHistory";
import { useSearchHistory } from "@/hooks/useSearchHistory";

const TranslatePage = () => {
  const { history, addToHistory, clearHistory, removeItem } = useSearchHistory('translation');
  const [translateQuery, setTranslateQuery] = useState("");

  const handleTranslationSelect = (query: string) => {
    setTranslateQuery(query);
  };

  const handleTranslationComplete = (query: string, results: any) => {
    addToHistory(query, results);
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Translation</h1>
          <p className="text-muted-foreground">
            Translate medical terms between different terminology systems
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ModernTranslateSection 
              onTranslationComplete={handleTranslationComplete}
              initialQuery={translateQuery}
            />
          </div>
          
          <div className="lg:col-span-1">
            <SearchHistory
              history={history}
              onSelect={handleTranslationSelect}
              onRemove={removeItem}
              onClear={clearHistory}
              title="Translation History"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;
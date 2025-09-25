import { useState } from "react";
import { IntegrationSection } from "@/components/IntegrationSection";
import { SearchHistory } from "@/components/SearchHistory";
import { useSearchHistory } from "@/hooks/useSearchHistory";

const IntegrationsPage = () => {
  const { history, addToHistory, clearHistory, removeItem } = useSearchHistory('integration');
  const [integrationQuery, setIntegrationQuery] = useState("");

  const handleIntegrationSelect = (query: string) => {
    setIntegrationQuery(query);
  };

  const handleIntegrationComplete = (query: string, results: any) => {
    addToHistory(query, results);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Integrations</h1>
          <p className="text-muted-foreground">
            Connect with WHO, SNOMED CT, and LOINC terminology systems
          </p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <IntegrationSection 
              onIntegrationComplete={handleIntegrationComplete}
              initialQuery={integrationQuery}
            />
          </div>
          
          <div className="lg:col-span-1">
            <SearchHistory
              history={history}
              onSelect={handleIntegrationSelect}
              onRemove={removeItem}
              onClear={clearHistory}
              title="Integration History"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
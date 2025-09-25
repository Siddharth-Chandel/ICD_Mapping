import { useState } from "react";
import { FhirProblemSection } from "@/components/FhirProblemSection";
import { SearchHistory } from "@/components/SearchHistory";
import { useSearchHistory } from "@/hooks/useSearchHistory";

const ProblemListPage = () => {
  const { history, addToHistory, clearHistory, removeItem } = useSearchHistory('problem');
  const [problemQuery, setProblemQuery] = useState("");

  const handleProblemSelect = (query: string) => {
    setProblemQuery(query);
  };

  const handleProblemComplete = (query: string, results: any) => {
    addToHistory(query, results);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Problem List</h1>
          <p className="text-muted-foreground">
            Manage FHIR problem lists and medical conditions
          </p>
        </div>
        
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <FhirProblemSection 
              onProblemComplete={handleProblemComplete}
              initialQuery={problemQuery}
            />
          </div>
          
          <div className="lg:col-span-1">
            <SearchHistory
              history={history}
              onSelect={handleProblemSelect}
              onRemove={removeItem}
              onClear={clearHistory}
              title="Problem List History"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemListPage;
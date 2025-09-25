import { useCallback } from "react";
import { ModernCSVIngestSection } from "@/components/ModernCSVIngestSection";

const IngestPage = () => {
  const handleIngestComplete = useCallback(() => {
    if ((window as any).loadDashboard) {
      (window as any).loadDashboard();
    }
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Data Ingestion</h1>
          <p className="text-muted-foreground">
            Upload and process CSV files containing medical terminology data
          </p>
        </div>
        <ModernCSVIngestSection onIngestComplete={handleIngestComplete} />
      </div>
    </div>
  );
};

export default IngestPage;
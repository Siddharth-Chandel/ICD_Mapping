import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, History } from "lucide-react";

export const AuditSection = () => {
  const [auditData, setAuditData] = useState("");
  const [provenanceData, setProvenanceData] = useState("");

  const loadAuditData = async () => {
    try {
      const [auditResponse, provenanceResponse] = await Promise.all([
        fetch('/audit'),
        fetch('/provenance')
      ]);
      
      const audit = await auditResponse.json();
      const provenance = await provenanceResponse.json();
      
      setAuditData(JSON.stringify(audit, null, 2));
      setProvenanceData(JSON.stringify(provenance, null, 2));
    } catch (error) {
      console.error('Audit load error:', error);
      setAuditData('Failed to load audit data');
      setProvenanceData('Failed to load provenance data');
    }
  };

  useEffect(() => {
    loadAuditData();
  }, []);

  // Expose loadAuditData to parent component
  useEffect(() => {
    (window as any).loadAuditData = loadAuditData;
    return () => {
      delete (window as any).loadAuditData;
    };
  }, []);

  return (
    <Card className="card-audit backdrop-blur-sm border-0 shadow-purple rounded-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <History className="h-5 w-5 text-primary" />
          5) Audit &amp; Provenance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">AuditEvent</span>
            </div>
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto h-72 text-muted-foreground">
              {auditData || 'Audit data will appear here...'}
            </pre>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Provenance</span>
            </div>
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto h-72 text-muted-foreground">
              {provenanceData || 'Provenance data will appear here...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
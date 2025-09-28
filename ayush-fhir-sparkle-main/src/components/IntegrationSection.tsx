import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Search, Copy, Download } from "lucide-react";
import { buildApiUrl, API_CONFIG } from "@/config/api";

interface IntegrationSectionProps {
  onIntegrationComplete?: (query: string, results: any) => void;
  initialQuery?: string;
}

export const IntegrationSection = ({ onIntegrationComplete, initialQuery = "" }: IntegrationSectionProps) => {
  const [whoQuery, setWhoQuery] = useState(initialQuery);
  const [semanticQuery, setSemanticQuery] = useState(initialQuery);
  const [whoResult, setWhoResult] = useState("");
  const [semanticResult, setSemanticResult] = useState("");
  const [isSearchingWho, setIsSearchingWho] = useState(false);
  const [isSearchingSemantic, setIsSearchingSemantic] = useState(false);

  // Update queries when initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setWhoQuery(initialQuery);
      setSemanticQuery(initialQuery);
    }
  }, [initialQuery]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const temp = document.createElement('textarea');
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    }
  };

  const downloadText = (filename: string, text: string) => {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleWhoSearch = async () => {
    if (!whoQuery.trim()) return;
    
    setIsSearchingWho(true);
    try {
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.WHO_TM2}?q=${encodeURIComponent(whoQuery)}`));
      const data = await response.json();
      setWhoResult(JSON.stringify(data, null, 2));

      // Call the completion callback
      if (onIntegrationComplete) {
        onIntegrationComplete(whoQuery, { who: data });
      }
    } catch (error) {
      console.error('WHO search error:', error);
      setWhoResult('Failed to search WHO ICD-11');
    } finally {
      setIsSearchingWho(false);
    }
  };

  const handleSemanticSearch = async () => {
    if (!semanticQuery.trim()) return;
    
    setIsSearchingSemantic(true);
    try {
      const [snomedResponse, loincResponse] = await Promise.all([
        fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.SNOMED}?q=${encodeURIComponent(semanticQuery)}`)),
        fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.LOINC}?q=${encodeURIComponent(semanticQuery)}`))
      ]);
      
      const snomed = await snomedResponse.json();
      const loinc = await loincResponse.json();
      const result = { snomed, loinc };
      
      setSemanticResult(JSON.stringify(result, null, 2));

      // Call the completion callback
      if (onIntegrationComplete) {
        onIntegrationComplete(semanticQuery, result);
      }
    } catch (error) {
      console.error('Semantic search error:', error);
      setSemanticResult('Failed to search SNOMED/LOINC');
    } finally {
      setIsSearchingSemantic(false);
    }
  };

  return (
    <Card className="card-integration backdrop-blur-sm border-0 shadow-glow rounded-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Globe className="h-5 w-5 text-primary" />
          6) WHO ICD-11 &amp; SNOMED/LOINC Integration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-icd11"></div>
              WHO ICD-11 TM2 Search
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search TM2 entities..."
                value={whoQuery}
                onChange={(e) => setWhoQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleWhoSearch()}
                className="input-field flex-1"
              />
              <Button
                onClick={handleWhoSearch}
                disabled={isSearchingWho}
                className="bg-icd11 hover:bg-icd11/90 text-white"
              >
                {isSearchingWho ? "Searching..." : "Search"}
              </Button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">WHO ICD-11 Results</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(whoResult)} disabled={!whoResult}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadText('who-results.json', whoResult)} disabled={!whoResult}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
            </div>
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto h-48 text-muted-foreground">
              {whoResult || 'WHO ICD-11 search results will appear here...'}
            </pre>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-snomed"></div>
                <div className="w-2 h-2 rounded-full bg-loinc"></div>
              </div>
              SNOMED CT / LOINC Search
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Search clinical terms..."
                value={semanticQuery}
                onChange={(e) => setSemanticQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSemanticSearch()}
                className="input-field flex-1"
              />
              <Button
                onClick={handleSemanticSearch}
                disabled={isSearchingSemantic}
                className="bg-gradient-to-r from-snomed to-loinc hover:from-snomed/90 hover:to-loinc/90 text-white"
              >
                {isSearchingSemantic ? "Searching..." : "Search"}
              </Button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-muted-foreground">SNOMED/LOINC Results</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(semanticResult)} disabled={!semanticResult}>
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadText('snomed-loinc-results.json', semanticResult)} disabled={!semanticResult}>
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
            </div>
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto h-48 text-muted-foreground">
              {semanticResult || 'SNOMED CT / LOINC search results will appear here...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
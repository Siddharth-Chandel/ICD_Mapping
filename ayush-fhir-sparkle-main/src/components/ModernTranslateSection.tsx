import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, Code2, Sparkles, Copy, Download } from "lucide-react";

interface TranslationTarget {
  system: string;
  title: string;
  code: string;
}

interface ModernTranslateSectionProps {
  onTranslationComplete?: (query: string, results: any) => void;
  initialQuery?: string;
}

export const ModernTranslateSection = ({ onTranslationComplete, initialQuery = "" }: ModernTranslateSectionProps) => {
  const [code, setCode] = useState(initialQuery);
  const [system, setSystem] = useState("namaste");
  const [translateResult, setTranslateResult] = useState<TranslationTarget[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  // Update code when initialQuery changes
  useEffect(() => {
    if (initialQuery) {
      setCode(initialQuery);
    }
  }, [initialQuery]);

  const handleTranslate = async () => {
    if (!code.trim()) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch(
        `/translate?code=${encodeURIComponent(code)}&system=${encodeURIComponent(system)}`
      );
      const data = await response.json();
      setTranslateResult(data.targets || []);

      // Call the completion callback
      if (onTranslationComplete) {
        onTranslationComplete(code, data);
      }
    } catch (error) {
      console.error('Translation error:', error);
      setTranslateResult([]);
    } finally {
      setIsTranslating(false);
    }
  };

  const getSystemColor = (systemName: string) => {
    switch (systemName.toLowerCase()) {
      case 'namaste': return 'coding-system-namaste';
      case 'icd11': return 'coding-system-icd11';
      case 'snomed': return 'coding-system-snomed';
      case 'loinc': return 'coding-system-loinc';
      default: return 'medical-code';
    }
  };

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

  return (
    <Card className="card-translate backdrop-blur-sm border-0 shadow-purple rounded-3xl overflow-hidden">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-3 bg-gradient-purple rounded-2xl shadow-purple">
            <ArrowRightLeft className="h-6 w-6 text-white" />
          </div>
          <span className="text-gradient">Step 3:</span> Code Translation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            placeholder="e.g., AY001 or TM2-AY134"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input-field"
          />
          <Select value={system} onValueChange={setSystem}>
            <SelectTrigger className="input-field">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="namaste">NAMASTE</SelectItem>
              <SelectItem value="icd11">ICD-11</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            onClick={handleTranslate} 
            disabled={isTranslating}
            className="btn-purple"
          >
            {isTranslating ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Code2 className="mr-2 h-4 w-4" />
                Translate
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-purple" />
            <span className="text-base font-semibold">Translation Results</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(JSON.stringify(translateResult, null, 2))} disabled={translateResult.length === 0}>
                <Copy className="h-4 w-4 mr-1" /> Copy
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadText(`translation-results.json`, JSON.stringify(translateResult, null, 2))} disabled={translateResult.length === 0}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
            </div>
          </div>
          
          {translateResult.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-auto">
              {translateResult.map((target, index) => (
                <div key={index} className="bg-card/50 backdrop-blur-sm border border-purple/20 rounded-2xl p-4">
                  <div className={`text-xs font-medium mb-2 px-3 py-1.5 rounded-full inline-block ${getSystemColor(target.system)}`}>
                    {target.system.toUpperCase()}
                  </div>
                  <div className="font-semibold text-card-foreground text-lg">{target.title}</div>
                  <div className="text-sm text-muted-foreground font-mono mt-1">{target.code}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card/50 backdrop-blur-sm border border-purple/20 rounded-2xl p-8 text-center">
              <Code2 className="h-12 w-12 text-purple/50 mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isTranslating ? "Translating..." : "Translation results will appear here..."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
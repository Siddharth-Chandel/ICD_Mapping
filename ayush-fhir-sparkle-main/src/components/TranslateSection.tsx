import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRightLeft, Code2 } from "lucide-react";

interface TranslationTarget {
  system: string;
  title: string;
  code: string;
}

interface TranslateSuggestion {
  label: string;
  namaste_code: string;
  confidence: number;
}

export const TranslateSection = () => {
  const [code, setCode] = useState("");
  const [system, setSystem] = useState("namaste");
  const [translateResult, setTranslateResult] = useState<TranslationTarget[]>([]);
  const [suggestions, setSuggestions] = useState<TranslateSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleTranslate = async () => {
    if (!code.trim()) return;
    
    setIsTranslating(true);
    try {
      const response = await fetch(
        `/translate?code=${encodeURIComponent(code)}&system=${encodeURIComponent(system)}`
      );
      const data = await response.json();
      setTranslateResult(data.targets || []);
    } catch (error) {
      console.error('Translation error:', error);
      setTranslateResult([]);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleTypeTranslate = useCallback(async (searchCode: string) => {
    if (!searchCode.trim()) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    try {
      const response = await fetch(`/suggest?q=${encodeURIComponent(searchCode)}`);
      const data = await response.json();
      const items = (data.suggestions || [])
        .filter((s: any) => (s.label || '').toLowerCase().startsWith(searchCode.toLowerCase()))
        .slice(0, 20)
        .map((s: any) => ({
          label: s.label,
          namaste_code: s.namaste_code,
          confidence: s.confidence
        }));
      setSuggestions(items);
      setShowDropdown(items.length > 0);
    } catch (error) {
      console.error('Type translate error:', error);
      setSuggestions([]);
      setShowDropdown(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setCode(value);
    handleTypeTranslate(value);
  };

  const handleSuggestionClick = (suggestion: TranslateSuggestion) => {
    setCode(suggestion.label);
    setShowDropdown(false);
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

  const getSystemColor = (systemName: string) => {
    switch (systemName.toLowerCase()) {
      case 'namaste':
        return 'coding-system-namaste';
      case 'icd11':
        return 'coding-system-icd11';
      case 'snomed':
        return 'coding-system-snomed';
      case 'loinc':
        return 'coding-system-loinc';
      default:
        return 'medical-code';
    }
  };

  return (
    <Card className="section-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <ArrowRightLeft className="h-5 w-5 text-primary" />
          3) Translate
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative" ref={dropdownRef}>
            <Input
              placeholder="e.g., AY001 or TM2-AY134"
              value={code}
              onChange={(e) => handleInputChange(e.target.value)}
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
            className="btn-secondary"
          >
            {isTranslating ? "Translating..." : "Translate"}
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Translation Results</span>
          </div>
          
          {translateResult.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-auto">
              {translateResult.map((target, index) => (
                <div key={index} className="border rounded-lg p-3 bg-card">
                  <div className={`text-xs font-medium mb-1 px-2 py-1 rounded inline-block ${getSystemColor(target.system)}`}>
                    {target.system.toUpperCase()}
                  </div>
                  <div className="font-semibold text-card-foreground">{target.title}</div>
                  <div className="text-xs text-muted-foreground font-mono">{target.code}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-muted border rounded-lg p-3 text-xs text-center text-muted-foreground h-56 flex items-center justify-center">
              {isTranslating ? "Translating..." : "Translation results will appear here..."}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { History, Trash2, Clock, Search, ChevronDown, ChevronRight, Eye, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  results?: any;
  type: 'search' | 'translation' | 'integration' | 'problem';
}

interface SearchHistoryProps {
  history: HistoryItem[];
  onSelect: (query: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  title?: string;
  className?: string;
}

export const SearchHistory = ({ 
  history, 
  onSelect, 
  onRemove, 
  onClear, 
  title = "Search History",
  className 
}: SearchHistoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const toggleItemExpansion = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getResultSummary = (results: any) => {
    if (!results) return null;
    
    if (results.search && results.search.matches) {
      return `${results.search.matches.length} matches found`;
    }
    if (results.suggest && results.suggest.suggestions) {
      return `${results.suggest.suggestions.length} suggestions`;
    }
    if (results.entities) {
      return `${results.entities.length} entities`;
    }
    if (results.targets) {
      return `${results.targets.length} translations`;
    }
    return 'Results available';
  };

  if (history.length === 0) {
    return (
      <Card className={cn("border-dashed", className)}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No search history yet</p>
          <p className="text-xs mt-1">Your searches will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            {title}
            <Badge variant="secondary" className="text-xs font-medium">
              {history.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs h-8 px-2"
            >
              {isExpanded ? (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronRight className="h-3 w-3 mr-1" />
                  Expand
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-xs text-destructive hover:text-destructive h-8 px-2"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <ScrollArea className="h-96">
            <div className="space-y-3 pr-2">
              {history.map((item) => {
                const isItemExpanded = expandedItems.has(item.id);
                const resultSummary = getResultSummary(item.results);
                
                return (
                  <Collapsible key={item.id} open={isItemExpanded} onOpenChange={() => toggleItemExpansion(item.id)}>
                    <div className="group">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-muted/30 to-muted/50 hover:from-muted/50 hover:to-muted/70 transition-all duration-200 cursor-pointer border border-transparent hover:border-primary/20">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                              <Search className="h-3 w-3 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate text-foreground">
                                {item.query}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(item.timestamp)}
                                </span>
                                {resultSummary && (
                                  <Badge variant="outline" className="text-xs">
                                    {resultSummary}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelect(item.query);
                              }}
                              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemove(item.id);
                              }}
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent className="mt-2">
                        <div className="ml-6 p-3 rounded-lg bg-muted/20 border border-muted/40">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-foreground">Search Details</h4>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(JSON.stringify(item.results, null, 2))}
                                className="h-6 px-2 text-xs"
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            
                            {item.results && (
                              <div className="space-y-2">
                                {item.results.search && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Search Results:</p>
                                    <div className="bg-background/50 rounded p-2 text-xs font-mono max-h-20 overflow-y-auto">
                                      {JSON.stringify(item.results.search, null, 2)}
                                    </div>
                                  </div>
                                )}
                                
                                {item.results.suggest && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">AI Suggestions:</p>
                                    <div className="bg-background/50 rounded p-2 text-xs font-mono max-h-20 overflow-y-auto">
                                      {JSON.stringify(item.results.suggest, null, 2)}
                                    </div>
                                  </div>
                                )}
                                
                                {item.results.entities && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Entities:</p>
                                    <div className="bg-background/50 rounded p-2 text-xs font-mono max-h-20 overflow-y-auto">
                                      {JSON.stringify(item.results.entities, null, 2)}
                                    </div>
                                  </div>
                                )}
                                
                                {item.results.targets && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-1">Translations:</p>
                                    <div className="bg-background/50 rounded p-2 text-xs font-mono max-h-20 overflow-y-auto">
                                      {JSON.stringify(item.results.targets, null, 2)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
};

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSVIngestSectionProps {
  onIngestComplete: () => void;
}

export const CSVIngestSection = ({ onIngestComplete }: CSVIngestSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);
  const [ingestResult, setIngestResult] = useState<string>("");
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    onDrop: (files) => {
      if (files.length > 0) {
        console.log("CSV file selected:", files[0].name);
      }
    }
  });

  const handleUpload = async () => {
    if (acceptedFiles.length === 0) {
      toast({
        title: "No file selected",
        description: "Please choose a CSV file first",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);
      
      const response = await fetch('/ingest-csv', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      setIngestResult(JSON.stringify(result));
      onIngestComplete();
      toast({
        title: "Upload successful",
        description: "CSV file has been processed successfully"
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to process CSV file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleLoadDefault = async () => {
    setIsLoadingDefault(true);
    try {
      const response = await fetch('/ingest-default', { method: 'POST' });
      const result = await response.json();
      setIngestResult(JSON.stringify(result));
      onIngestComplete();
      toast({
        title: "Default data loaded",
        description: "200 default records have been loaded successfully"
      });
    } catch (error) {
      console.error('Load default error:', error);
      toast({
        title: "Load failed",
        description: "Failed to load default records",
        variant: "destructive"
      });
    } finally {
      setIsLoadingDefault(false);
    }
  };

  return (
    <Card className="section-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Database className="h-5 w-5 text-primary" />
          1) Ingest NAMASTE CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start">
          <div className="flex-1">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? "border-primary bg-primary-light"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary-light/50"
              }`}
            >
              <input {...getInputProps()} />
              {acceptedFiles.length > 0 ? (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <FileText className="h-5 w-5" />
                  <span className="font-medium">{acceptedFiles[0].name}</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {isDragActive
                      ? "Drop the CSV file here..."
                      : "Drag & drop a CSV file here, or click to select"}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading || acceptedFiles.length === 0}
              className="btn-primary"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
            <Button
              onClick={handleLoadDefault}
              disabled={isLoadingDefault}
              variant="secondary"
              className="btn-secondary"
            >
              {isLoadingDefault ? "Loading..." : "Load default 200 records"}
            </Button>
          </div>
        </div>
        
        {ingestResult && (
          <div className="mt-4">
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto max-h-32 text-muted-foreground">
              {ingestResult}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
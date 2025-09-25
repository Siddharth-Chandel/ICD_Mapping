import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Database, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ModernCSVIngestSectionProps {
  onIngestComplete: () => void;
}

export const ModernCSVIngestSection = ({ onIngestComplete }: ModernCSVIngestSectionProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDefault, setIsLoadingDefault] = useState(false);
  const [ingestResult, setIngestResult] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'text/csv': ['.csv']
    },
    multiple: false,
    onDrop: (files) => {
      if (files.length > 0) {
        setSuccess(false);
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
      setSuccess(true);
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
      setSuccess(true);
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
    <Card className="card-ingest backdrop-blur-sm border-0 shadow-success rounded-3xl overflow-hidden">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-3 bg-gradient-success rounded-2xl shadow-success">
            <Database className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-gradient">Step 1:</span> Ingest NAMASTE CSV
            {success && <CheckCircle2 className="inline-block ml-2 h-5 w-5 text-success" />}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          <div className="flex-1 w-full">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive
                  ? "border-success bg-success/10 scale-105"
                  : "border-success/30 hover:border-success/60 hover:bg-success/5"
              } ${success ? "border-success bg-success/10" : ""}`}
            >
              <input {...getInputProps()} />
              {acceptedFiles.length > 0 ? (
                <div className="flex items-center justify-center gap-3 text-success">
                  <FileText className="h-8 w-8" />
                  <div>
                    <p className="font-semibold text-lg">{acceptedFiles[0].name}</p>
                    <p className="text-sm text-muted-foreground">Ready to upload</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="p-4 bg-success/10 rounded-2xl">
                      <Upload className="h-12 w-12 text-success" />
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-card-foreground">
                      {isDragActive
                        ? "Drop the CSV file here..."
                        : "Drag & Drop CSV File"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Or click to browse your files
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUpload}
              disabled={isUploading || acceptedFiles.length === 0}
              className="btn-success min-w-[200px]"
            >
              {isUploading ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload CSV
                </>
              )}
            </Button>
            <Button
              onClick={handleLoadDefault}
              disabled={isLoadingDefault}
              variant="outline"
              className="min-w-[200px] border-success/30 text-success hover:bg-success/10"
            >
              {isLoadingDefault ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Load Demo Data
                </>
              )}
            </Button>
          </div>
        </div>
        
        {ingestResult && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Processing Result</span>
            </div>
            <pre className="bg-card/50 border border-success/20 rounded-2xl p-4 text-xs overflow-auto max-h-32 text-muted-foreground backdrop-blur-sm">
              {ingestResult}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
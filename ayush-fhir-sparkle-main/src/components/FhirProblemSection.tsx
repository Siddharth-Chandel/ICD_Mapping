import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FhirProblemSection = () => {
  const [problemCode, setProblemCode] = useState("");
  const [problemResult, setProblemResult] = useState("");
  const [accessSubject, setAccessSubject] = useState("");
  const [accessAction, setAccessAction] = useState("");
  const [accessResource, setAccessResource] = useState("");
  const [accessResult, setAccessResult] = useState("");
  const [isCreatingProblem, setIsCreatingProblem] = useState(false);
  const [isCheckingAccess, setIsCheckingAccess] = useState(false);
  const { toast } = useToast();

  const handleCreateProblemList = async () => {
    if (!problemCode.trim()) {
      toast({
        title: "Code required",
        description: "Please enter a NAMASTE code",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication required", 
        description: "Please authenticate first",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingProblem(true);
    try {
      const response = await fetch(
        `/fhir/problem-list?namaste_code=${encodeURIComponent(problemCode)}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      setProblemResult(JSON.stringify(data, null, 2));
      
      toast({
        title: "Problem list created",
        description: "FHIR problem list entry has been created successfully"
      });
    } catch (error) {
      console.error('Problem list error:', error);
      toast({
        title: "Creation failed",
        description: "Failed to create problem list entry",
        variant: "destructive"
      });
      setProblemResult('Failed to create problem list');
    } finally {
      setIsCreatingProblem(false);
    }
  };

  const handleCheckAccess = async () => {
    if (!accessSubject.trim() || !accessAction.trim() || !accessResource.trim()) {
      toast({
        title: "All fields required",
        description: "Please fill in all access control fields",
        variant: "destructive"
      });
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please authenticate first", 
        variant: "destructive"
      });
      return;
    }

    setIsCheckingAccess(true);
    try {
      const params = new URLSearchParams({
        subject_id: accessSubject,
        subject_type: 'practitioner',
        subject_roles: 'doctor',
        action: accessAction,
        resource_type: accessResource
      });

      const response = await fetch(`/access-check?${params}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setAccessResult(JSON.stringify(data, null, 2));
      
      toast({
        title: "Access check completed",
        description: "Access control evaluation has been completed"
      });
    } catch (error) {
      console.error('Access check error:', error);
      toast({
        title: "Access check failed",
        description: "Failed to check access permissions",
        variant: "destructive"
      });
      setAccessResult('Failed to check access');
    } finally {
      setIsCheckingAccess(false);
    }
  };

  return (
    <Card className="card-fhir backdrop-blur-sm border-0 shadow-success rounded-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5 text-primary" />
          7) FHIR Problem List with Dual Coding
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              Create Problem List Entry
            </h3>
            <div className="flex gap-2">
              <Input
                placeholder="Enter NAMASTE code (e.g., AY001)"
                value={problemCode}
                onChange={(e) => setProblemCode(e.target.value)}
                className="input-field flex-1"
              />
              <Button
                onClick={handleCreateProblemList}
                disabled={isCreatingProblem}
                className="bg-success hover:bg-success/90 text-white"
              >
                {isCreatingProblem ? "Creating..." : "Create"}
              </Button>
            </div>
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto h-64 text-muted-foreground">
              {problemResult || 'Problem list result will appear here...'}
            </pre>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Lock className="h-4 w-4 text-warning" />
              ISO 22600 Access Control
            </h3>
            <div className="space-y-2">
              <Input
                placeholder="Subject ID"
                value={accessSubject}
                onChange={(e) => setAccessSubject(e.target.value)}
                className="input-field"
              />
              <Input
                placeholder="Action (read/write)"
                value={accessAction}
                onChange={(e) => setAccessAction(e.target.value)}
                className="input-field"
              />
              <Input
                placeholder="Resource Type"
                value={accessResource}
                onChange={(e) => setAccessResource(e.target.value)}
                className="input-field"
              />
              <Button
                onClick={handleCheckAccess}
                disabled={isCheckingAccess}
                className="w-full bg-warning hover:bg-warning/90 text-white"
              >
                {isCheckingAccess ? "Checking Access..." : "Check Access"}
              </Button>
            </div>
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto h-64 text-muted-foreground">
              {accessResult || 'Access control result will appear here...'}
            </pre>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
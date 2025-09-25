import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthBundleSectionProps {
  onAuditUpdate: () => void;
}

export const AuthBundleSection = ({ onAuditUpdate }: AuthBundleSectionProps) => {
  const [abhaId, setAbhaId] = useState("");
  const [authResult, setAuthResult] = useState("");
  const [bundleResult, setBundleResult] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSendingBundle, setIsSendingBundle] = useState(false);
  const { toast } = useToast();

  const handleAuth = async () => {
    if (!abhaId.trim()) {
      toast({
        title: "ABHA ID required",
        description: "Please enter an ABHA ID",
        variant: "destructive"
      });
      return;
    }

    setIsAuthenticating(true);
    try {
      const response = await fetch(`/auth?abha_id=${encodeURIComponent(abhaId)}`, {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        toast({
          title: "Authentication successful",
          description: "Access token has been stored"
        });
      }
      
      setAuthResult(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Authentication failed",
        description: "Failed to authenticate with ABHA",
        variant: "destructive"
      });
      setAuthResult('Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSendBundle = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please authenticate first",
        variant: "destructive"
      });
      return;
    }

    setIsSendingBundle(true);
    try {
      const bundle = {
        resourceType: 'Bundle',
        type: 'transaction',
        entry: [
          { 
            resource: { 
              resourceType: 'Patient', 
              id: 'p1', 
              name: [{ text: 'Test Patient' }] 
            } 
          },
          { 
            resource: { 
              resourceType: 'Practitioner', 
              id: 'pr1', 
              name: [{ text: 'Dr. Demo' }] 
            } 
          },
          { 
            resource: { 
              resourceType: 'Encounter', 
              id: 'e1', 
              status: 'finished' 
            } 
          },
          { 
            resource: { 
              resourceType: 'Condition', 
              id: 'c1', 
              code: { 
                coding: [
                  { system: 'http://example.com/CodeSystem/namaste', code: 'AY001' },
                  { system: 'http://id.who.int/icd11', code: 'TM2-AY134' }
                ] 
              } 
            } 
          }
        ]
      };

      const response = await fetch('/ingest-bundle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bundle)
      });

      const data = await response.json();
      setBundleResult(JSON.stringify(data, null, 2));
      onAuditUpdate();
      
      toast({
        title: "Bundle sent successfully",
        description: "FHIR bundle has been processed"
      });
    } catch (error) {
      console.error('Bundle error:', error);
      toast({
        title: "Bundle sending failed",
        description: "Failed to send FHIR bundle",
        variant: "destructive"
      });
      setBundleResult('Bundle sending failed');
    } finally {
      setIsSendingBundle(false);
    }
  };

  return (
    <Card className="card-auth backdrop-blur-sm border-0 shadow-warning rounded-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Shield className="h-5 w-5 text-primary" />
          4) Mock ABHA OAuth &amp; Bundle Ingest
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter ABHA ID"
            value={abhaId}
            onChange={(e) => setAbhaId(e.target.value)}
            className="input-field flex-1"
          />
          <Button
            onClick={handleAuth}
            disabled={isAuthenticating}
            className="btn-primary"
          >
            {isAuthenticating ? "Authenticating..." : "Auth"}
          </Button>
        </div>

        {authResult && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Authentication Result</span>
            <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto max-h-32 text-muted-foreground">
              {authResult}
            </pre>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleSendBundle}
            disabled={isSendingBundle}
            className="btn-secondary self-start"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isSendingBundle ? "Sending Bundle..." : "Send Bundle"}
          </Button>

          {bundleResult && (
            <div className="space-y-2">
              <span className="text-sm font-medium">Bundle Result</span>
              <pre className="bg-muted border rounded-lg p-3 text-xs overflow-auto max-h-24 text-muted-foreground">
                {bundleResult}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
import { useCallback } from "react";
import { AuthBundleSection } from "@/components/AuthBundleSection";
import { AuditSection } from "@/components/AuditSection";

const AuthBundlePage = () => {
  const handleAuditUpdate = useCallback(() => {
    if ((window as any).loadAuditData) {
      (window as any).loadAuditData();
    }
  }, []);

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Authentication & Audit</h1>
          <p className="text-muted-foreground">
            Manage authentication bundles and view audit trails
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <AuthBundleSection onAuditUpdate={handleAuditUpdate} />
          <AuditSection />
        </div>
      </div>
    </div>
  );
};

export default AuthBundlePage;
import { Link } from "react-router-dom";
import { ModernHeader } from "@/components/ModernHeader";
import { HeroSection } from "@/components/HeroSection";
import { WelcomeSection } from "@/components/WelcomeSection";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Database, Search, ArrowRightLeft, Shield, Globe, FileText } from "lucide-react";

const Index = () => {
  const features = [
    { name: "Dashboard", href: "/dashboard", icon: BarChart3, description: "View system statistics and insights" },
    { name: "Data Ingestion", href: "/ingest", icon: Database, description: "Upload and process CSV files" },
    { name: "Search", href: "/search", icon: Search, description: "Search medical terminology" },
    { name: "Translation", href: "/translate", icon: ArrowRightLeft, description: "Translate between terminology systems" },
    { name: "Auth & Audit", href: "/auth-bundle", icon: Shield, description: "Manage authentication and audit trails" },
    { name: "Integrations", href: "/integrations", icon: Globe, description: "Connect with WHO, SNOMED CT, LOINC" },
    { name: "Problem List", href: "/problem-list", icon: FileText, description: "Manage FHIR problem lists" },
  ];

  return (
    <div className="min-h-screen">
      <ModernHeader />
      
      <HeroSection />
      
      <WelcomeSection />
      
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-foreground mb-4">Explore Our Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Navigate through our comprehensive healthcare interoperability platform using the sidebar or the quick access cards below.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => (
            <Link
              key={feature.name}
              to={feature.href}
              className="group p-6 bg-card border border-border/50 rounded-xl hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{feature.name}</h3>
              </div>
              <p className="text-muted-foreground text-sm mb-4">{feature.description}</p>
              <div className="flex items-center text-primary text-sm font-medium group-hover:translate-x-1 transition-transform">
                Get started <ArrowRight className="h-4 w-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90">
            <Link to="/dashboard">
              <BarChart3 className="h-5 w-5 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </main>

      <footer className="py-12 text-center text-muted-foreground border-t border-border/30 mt-24 bg-card/20 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-lg mb-2">&copy; 2025 Ayush Interop</p>
          <p className="text-sm opacity-80">Advanced Healthcare Interoperability Platform</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
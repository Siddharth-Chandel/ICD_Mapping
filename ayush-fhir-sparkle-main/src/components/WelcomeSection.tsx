import { Database, Search, ArrowRightLeft, Shield, History, Globe, FileText, BarChart3 } from "lucide-react";

export const WelcomeSection = () => {
  const features = [
    {
      icon: Database,
      title: "CSV Data Ingestion",
      description: "Upload and process NAMASTE medical coding data",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      icon: Search,
      title: "AI-Powered Search",
      description: "Intelligent search with autocomplete suggestions",
      color: "text-info",
      bgColor: "bg-info/10"
    },
    {
      icon: ArrowRightLeft,
      title: "Code Translation",
      description: "Seamless translation between coding systems",
      color: "text-purple",
      bgColor: "bg-purple/10"
    },
    {
      icon: Shield,
      title: "ABHA Authentication",
      description: "Secure OAuth integration with ABHA",
      color: "text-warning",
      bgColor: "bg-warning/10"
    },
    {
      icon: History,
      title: "Audit & Provenance",
      description: "Complete tracking of all data operations",
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      icon: Globe,
      title: "Global Standards",
      description: "WHO ICD-11, SNOMED CT, LOINC integration",
      color: "text-secondary",
      bgColor: "bg-secondary/10"
    },
    {
      icon: FileText,
      title: "FHIR Compliance",
      description: "Full FHIR R4 compliant problem lists",
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Real-time insights and reporting",
      color: "text-primary",
      bgColor: "bg-primary/10"
    }
  ];

  return (
    <section id="welcome-section" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="text-gradient">Welcome to the Future</span>
            <br />
            <span className="text-foreground/80">of Healthcare Interoperability</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Experience the next generation of medical data exchange with our comprehensive platform 
            that seamlessly connects different healthcare coding systems, ensuring interoperability 
            and compliance across the healthcare ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all duration-500 hover:scale-105 hover:shadow-glow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground group-hover:text-card-foreground/80 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-primary text-white px-6 py-3 rounded-full font-medium">
            <Sparkles className="h-5 w-5" />
            <span>All features are fully integrated and ready to use</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0l1.09 3.45L16 3l-2.91 1.09L12 7.5 10.91 4.09 8 3l3.09 1.45L12 0zm-6.18 9l-.87 2.75L2 11l2.95.75L6.82 15l.87-2.75L10 12l-2.95-.75L5.18 9zm12.36 6l-.87 2.75L14 17l2.95.75L18.82 21l.87-2.75L22 18l-2.95-.75L17.18 15z"/>
  </svg>
);
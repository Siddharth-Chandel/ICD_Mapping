import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Database, 
  Search, 
  ArrowRightLeft, 
  Shield, 
  History, 
  Globe, 
  FileText, 
  BarChart3,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Data Ingestion", href: "/ingest", icon: Database },
  { name: "Search", href: "/search", icon: Search },
  { name: "Translation", href: "/translate", icon: ArrowRightLeft },
  { name: "Auth & Audit", href: "/auth-bundle", icon: Shield },
  { name: "Integrations", href: "/integrations", icon: Globe },
  { name: "Problem List", href: "/problem-list", icon: FileText },
];

export const Layout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border/50 backdrop-blur-sm">
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-border/30">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Ayush Interop</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary border-l-2 border-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border/30">
            <div className="text-xs text-muted-foreground text-center">
              <p>&copy; 2025 Ayush Interop</p>
              <p>Healthcare Interoperability Platform</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

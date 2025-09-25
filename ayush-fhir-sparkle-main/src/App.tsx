import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import IngestPage from "./pages/IngestPage";
import SearchPage from "./pages/SearchPage";
import TranslatePage from "./pages/TranslatePage";
import AuthBundlePage from "./pages/AuthBundlePage";
import IntegrationsPage from "./pages/IntegrationsPage";
import ProblemListPage from "./pages/ProblemListPage";
import DashboardPage from "./pages/DashboardPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/" element={<Layout />}>
            <Route path="ingest" element={<IngestPage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="translate" element={<TranslatePage />} />
            <Route path="auth-bundle" element={<AuthBundlePage />} />
            <Route path="integrations" element={<IntegrationsPage />} />
            <Route path="problem-list" element={<ProblemListPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { DashboardSection } from "@/components/DashboardSection";

const DashboardPage = () => {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of system statistics and data insights
          </p>
        </div>
        <DashboardSection />
      </div>
    </div>
  );
};

export default DashboardPage;
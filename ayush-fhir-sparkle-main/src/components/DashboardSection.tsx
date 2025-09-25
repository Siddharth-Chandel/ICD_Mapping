import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopTerm {
  label: string;
  count: number;
}

interface StatsData {
  rate_percent: number;
  dual_coded_terms: number;
  total_terms: number;
}

export const DashboardSection = () => {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [topTerms, setTopTerms] = useState<TopTerm[]>([]);

  const loadDashboard = async () => {
    try {
      const [topResponse, rateResponse] = await Promise.all([
        fetch('/stats/top-terms'),
        fetch('/stats/dual-coding-rate')
      ]);
      
      const topData = await topResponse.json();
      const rateData = await rateResponse.json();
      
      setTopTerms(topData.items || []);
      setStatsData(rateData);
    } catch (error) {
      console.error('Dashboard load error:', error);
      setTopTerms([]);
      setStatsData(null);
    }
  };

  useEffect(() => {
    loadDashboard();
    
    // Expose loadDashboard to window for external calls
    (window as any).loadDashboard = loadDashboard;
    
    return () => {
      delete (window as any).loadDashboard;
    };
  }, []);

  const chartData = {
    labels: topTerms.map(term => term.label),
    datasets: [
      {
        label: 'Top NAMASTE Terms',
        data: topTerms.map(term => term.count),
        backgroundColor: 'hsl(var(--primary))',
        borderColor: 'hsl(var(--primary))',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'hsl(var(--border))',
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'hsl(var(--muted-foreground))',
          maxRotation: 45,
        },
      },
    },
  };

  return (
    <Card className="card-dashboard backdrop-blur-sm border-0 shadow-glow rounded-3xl overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
          8) Dashboard &amp; Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          {statsData ? (
            <div className="flex items-center gap-4">
              <div className="px-4 py-2 bg-primary-light rounded-lg">
                <span className="text-sm font-medium text-primary">
                  Dual-coding: {statsData.rate_percent}%
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({statsData.dual_coded_terms}/{statsData.total_terms})
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Loading statistics...</div>
          )}
        </div>
        
        <div className="bg-gradient-to-r from-primary-light to-accent rounded-xl p-6">
          <div className="h-80">
            {topTerms.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Loading chart data...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
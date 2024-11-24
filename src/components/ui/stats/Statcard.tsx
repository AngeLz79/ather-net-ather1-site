import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { calculatePercentageChange } from '@/components/utils/ather';
import { TrendData } from '@/types/ather';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Filler);

interface StatCardProps {
  title: string;
  count: number;
  trend: TrendData[];
  color: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, count, trend, color }) => {
  const [animatedCount, setAnimatedCount] = useState(0);
  const [filteredTrend, setFilteredTrend] = useState<TrendData[]>([]); // State for filtered data
  const [dataLoaded, setDataLoaded] = useState(false); // Track if data has fully loaded

  // Calculate percentage change
  const percentageChange = dataLoaded
    ? calculatePercentageChange(trend[0]?.data_count || 0, trend[trend.length - 1]?.data_count || 0)
    : 0;

  // Animation logic: count-up effect
  useEffect(() => {
    const duration = 2000;
    const start = animatedCount;
    const end = count;
    const startTime = performance.now();

    const animate = (timestamp: number) => {
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setAnimatedCount(Math.floor(start + progress * (end - start)));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [count]);

  // Handle data filtering for the last minute
  useEffect(() => {
    if (trend.length > 0) {
      setFilteredTrend(trend.slice(-60)); // Keep only the last 60 seconds of data
      setDataLoaded(true); // Mark as fully loaded after trend is processed
    }
  }, [trend]);

  const chartData = {
    labels: filteredTrend.map((_, index) => `${index}s`),
    datasets: [
      {
        data: filteredTrend.map((point) => point.data_count),
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    elements: {
      point: { radius: 0 },
    },
  };

  return (
    <div className="w-full">
      <Card className={`${color} text-white h-full`}>
        <CardContent className="p-4">
          <div className="flex flex-col space-y-1 mb-2">
            <div className="text-sm font-medium opacity-80">{title}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="text-2xl font-bold mb-1">{animatedCount.toLocaleString()}</div>
              <div className="text-sm opacity-80">
                {percentageChange.toFixed(2)}%
                {percentageChange >= 0 ? (
                  <span className="inline-block ml-1">↑</span>
                ) : (
                  <span className="inline-block ml-1">↓</span>
                )}
              </div>
            </div>
            <div className="w-32 h-16">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

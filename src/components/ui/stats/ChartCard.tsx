import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { TrendData } from '@/types/ather';

interface ChartCardProps {
  title: string;
  data: TrendData[];
  color: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, data, color }) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis
              dataKey="time"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return isNaN(date.getTime())
                  ? value // Return raw value if invalid
                  : date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }); // Full date format
              }}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(31, 41, 55, 0.8)', borderRadius: '6px' }}
              labelStyle={{ color: '#ccc' }}
              itemStyle={{ color: color }}
              formatter={(value: number) => [value.toLocaleString(), 'Count']}
              labelFormatter={(value) => {
                const date = new Date(value);
                return isNaN(date.getTime())
                  ? value // Return raw value if invalid
                  : date.toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' }); // Full date format
              }}
            />
            <Line
              type="monotone"
              dataKey="data_count"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

 
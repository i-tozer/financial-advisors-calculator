import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';
import { formatCurrency } from './WealthCalculator';

interface GaugeChartProps {
  value: number;
  min: number;
  max: number;
  unit: string;
  title: string;
  description?: string;
  colors?: string[];
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min,
  max,
  unit,
  title,
  description,
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe']
}) => {
  // Normalize value between 0 and 1
  const normalizedValue = Math.min(Math.max((value - min) / (max - min), 0), 1);
  
  // Create data for the gauge
  const data = [
    { name: 'value', value: normalizedValue },
    { name: 'empty', value: 1 - normalizedValue }
  ];

  // Format the display value
  const displayValue = unit === '%' 
    ? `${(value * 100).toFixed(1)}${unit}`
    : unit === '£' ? formatCurrency(value) : `${value}${unit}`;

  return (
    <div className="gauge-chart">
      <h3>{title}</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell key="cell-0" fill={colors[0]} />
              <Cell key="cell-1" fill="#f3f6f9" />
              <Label
                value={displayValue}
                position="center"
                fill="#333"
                style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {description && <p className="gauge-description">{description}</p>}
    </div>
  );
};

export default GaugeChart;
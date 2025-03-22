import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatCurrency } from './WealthCalculator';

interface WealthChartProps {
  years: number;
  monthlyContribution: number;
  annualReturnRate: number;
  advisorFeeRate: number;
  fundCostRate: number;
}

const WealthChart: React.FC<WealthChartProps> = ({
  years,
  monthlyContribution,
  annualReturnRate,
  advisorFeeRate,
  fundCostRate
}) => {
  // Calculate wealth data for the chart
  const data = React.useMemo(() => {
    const chartData = [];
    
    // Calculate values at yearly intervals
    for (let year = 0; year <= years; year++) {
      const months = year * 12;
      
      let withoutFeesValue = 0;
      let withFundFeesValue = 0;
      let withAllFeesValue = 0;
      
      const monthlyReturnRate = Math.pow(1 + annualReturnRate, 1/12) - 1;
      const monthlyAdvisorFeeRate = Math.pow(1 + advisorFeeRate, 1/12) - 1;
      const monthlyFundCostRate = Math.pow(1 + fundCostRate, 1/12) - 1;
      
      for (let month = 1; month <= months; month++) {
        // Add monthly contribution
        withoutFeesValue += monthlyContribution;
        withFundFeesValue += monthlyContribution;
        withAllFeesValue += monthlyContribution;
        
        // Apply returns without any fees
        withoutFeesValue *= (1 + monthlyReturnRate);
        
        // Apply returns minus fund fees only
        withFundFeesValue *= (1 + monthlyReturnRate - monthlyFundCostRate);
        
        // Apply returns minus fund fees, then advisor fees
        withAllFeesValue *= (1 + monthlyReturnRate - monthlyFundCostRate);
        withAllFeesValue *= (1 - monthlyAdvisorFeeRate / (1 + monthlyReturnRate - monthlyFundCostRate));
      }
      
      chartData.push({
        year,
        withoutFees: Math.round(withoutFeesValue),
        withFundFees: Math.round(withFundFeesValue),
        withAllFees: Math.round(withAllFeesValue)
      });
    }
    
    return chartData;
  }, [years, monthlyContribution, annualReturnRate, advisorFeeRate, fundCostRate]);

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ 
          backgroundColor: 'white', 
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px'
        }}>
          <p className="label">{`Year: ${label}`}</p>
          <p style={{ color: '#0088fe' }}>
            {`No Fees: ${formatCurrency(payload[0].value)}`}
          </p>
          <p style={{ color: '#ffb300' }}>
            {`With Fund Fees Only: ${formatCurrency(payload[1].value)}`}
          </p>
          <p style={{ color: '#ff5252' }}>
            {`With All Fees: ${formatCurrency(payload[2].value)}`}
          </p>
          {payload[0].value > 0 && (
            <>
              <p style={{ color: '#d32f2f' }}>
                {`Fund Fee Impact: ${((payload[0].value - payload[1].value) / payload[0].value * 100).toFixed(1)}%`}
              </p>
              <p style={{ color: '#d32f2f' }}>
                {`Advisor Fee Additional Impact: ${((payload[1].value - payload[2].value) / payload[0].value * 100).toFixed(1)}%`}
              </p>
              <p style={{ color: '#d32f2f' }}>
                {`Total Fee Impact: ${((payload[0].value - payload[2].value) / payload[0].value * 100).toFixed(1)}%`}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="wealth-chart">
      <h2>Wealth Accumulation Over Time</h2>
      <div style={{ width: '100%', height: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" label={{ value: 'Years', position: 'insideBottom', offset: -5 }} />
            <YAxis
              tickFormatter={(value) => `£${value.toLocaleString()}`}
              label={{ value: 'Wealth (£)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '10px' }} />
            <Line
              type="monotone"
              dataKey="withoutFees"
              name="No Fees"
              stroke="#0088fe"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="withFundFees"
              name="With Fund Fees Only"
              stroke="#ffb300"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="withAllFees"
              name="With All Fees"
              stroke="#ff5252"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WealthChart;
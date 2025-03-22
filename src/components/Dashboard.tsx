import React, { useState } from 'react';
import GaugeChart from './GaugeChart';
import WealthChart from './WealthChart';
import { calculateWealthAccumulation, formatCurrency } from './WealthCalculator';

const Dashboard: React.FC = () => {
  // Initialize state with default values
  const [monthlyContribution, setMonthlyContribution] = useState(1000);
  const [years, setYears] = useState(30);
  const [annualReturnRate, setAnnualReturnRate] = useState(0.05); // 5%
  const [advisorFeeRate, setAdvisorFeeRate] = useState(0.03); // 3%
  const [fundCostRate, setFundCostRate] = useState(0.02); // 2%

  // Calculate wealth based on current parameters
  const wealth = calculateWealthAccumulation({
    monthlyContribution,
    years,
    annualReturnRate,
    advisorFeeRate,
    fundCostRate
  });
  
  // Calculate actual profits and investments
  const totalInvestment = monthlyContribution * 12 * years;
  const totalPotentialProfit = wealth.withoutFees - totalInvestment;
  
  // Calculate fund profit (money taken by fund)
  const fundProfit = wealth.withAdvisorFees - wealth.withAllFees;
  
  // Calculate advisor profit (money taken by advisor)
  const advisorProfit = wealth.withoutFees - wealth.withAdvisorFees;
  
  // Calculate investor profit (money you get to keep)
  const investorProfit = wealth.withAllFees - totalInvestment;
  
  // Calculate total fees paid
  const totalFeesPaid = wealth.withoutFees - wealth.withAllFees;
  
  // Calculate percentages of the total potential profit
  const fundProfitPercentage = (fundProfit / totalPotentialProfit) * 100;
  const advisorProfitPercentage = (advisorProfit / totalPotentialProfit) * 100;
  const investorProfitPercentage = (investorProfit / totalPotentialProfit) * 100;
  
  // Calculate percentages of total potential value (investment + profit)
  const fundImpactOnTotal = (fundProfit / wealth.withoutFees) * 100;
  const advisorImpactOnTotal = (advisorProfit / wealth.withoutFees) * 100;
  const totalFeesImpactOnTotal = (totalFeesPaid / wealth.withoutFees) * 100;
  const investorPortionOfTotal = (wealth.withAllFees / wealth.withoutFees) * 100;

  // Generate monthly data for audit table
  const generateMonthlyData = () => {
    const result = [];
    const monthlyReturnRate = Math.pow(1 + annualReturnRate, 1/12) - 1;
    const monthlyAdvisorFeeRate = advisorFeeRate / 12;
    const monthlyFundCostRate = fundCostRate / 12;
    
    let withoutFees = 0;
    let withAdvisorFees = 0;
    let withAllFees = 0;
    
    for (let month = 1; month <= Math.min(12 * years, 36); month++) { // Show up to 36 months (3 years) max
      // Add monthly contribution
      withoutFees += monthlyContribution;
      withAdvisorFees += monthlyContribution;
      withAllFees += monthlyContribution;
      
      // Apply returns without any fees
      const returnNoFees = withoutFees * monthlyReturnRate;
      withoutFees += returnNoFees;
      
      // Apply returns minus fund fees only
      const returnWithFundFees = withAdvisorFees * (monthlyReturnRate - monthlyFundCostRate);
      withAdvisorFees += returnWithFundFees;
      
      // Apply returns minus both fees
      const returnWithAllFees = withAllFees * (monthlyReturnRate - monthlyFundCostRate);
      const advisorFee = (withAllFees + returnWithAllFees) * monthlyAdvisorFeeRate;
      withAllFees += returnWithAllFees - advisorFee;
      
      // Calculate fee amounts for this month
      const fundFee = withAdvisorFees * monthlyFundCostRate;
      
      result.push({
        month,
        contribution: monthlyContribution,
        withoutFees: Math.round(withoutFees),
        withAdvisorFees: Math.round(withAdvisorFees),
        withAllFees: Math.round(withAllFees),
        returnNoFees: Math.round(returnNoFees),
        fundFee: Math.round(fundFee),
        advisorFee: Math.round(advisorFee)
      });
    }
    
    return result;
  };

  // Handle inputs with error checking
  const handleMonthlyContributionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setMonthlyContribution(value);
    }
  };

  const handleYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= 50) {
      setYears(value);
    }
  };

  const handleRateChange = (setter: React.Dispatch<React.SetStateAction<number>>) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseFloat(e.target.value) / 100;
      if (!isNaN(value) && value >= 0 && value <= 0.5) {
        setter(value);
      }
    };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Financial Advisor Fee Impact Calculator</h1>
        <p>See how fees impact your wealth accumulation over time</p>
      </header>

      <div className="dashboard-layout">
        {/* Top row with chart and parameters */}
        <div className="top-row">
          {/* Chart Section */}
          <section className="chart-section">
            <WealthChart
              years={years}
              monthlyContribution={monthlyContribution}
              annualReturnRate={annualReturnRate}
              advisorFeeRate={advisorFeeRate}
              fundCostRate={fundCostRate}
            />
          </section>

          {/* Parameters Section */}
          <section className="parameters-section">
            <h2>Investment Parameters</h2>
            <div className="parameters-sidebar">
              <div className="parameter-input">
                <label htmlFor="monthly-contribution">Monthly Contribution (£)</label>
                <input
                  id="monthly-contribution"
                  type="number"
                  value={monthlyContribution}
                  onChange={handleMonthlyContributionChange}
                  min="1"
                  step="100"
                />
              </div>
              
              <div className="parameter-input">
                <label htmlFor="years">Investment Period (Years)</label>
                <input
                  id="years"
                  type="number"
                  value={years}
                  onChange={handleYearsChange}
                  min="1"
                  max="50"
                />
              </div>
              
              <div className="parameter-input">
                <label htmlFor="annual-return">Annual Return Rate (%)</label>
                <input
                  id="annual-return"
                  type="number"
                  value={annualReturnRate * 100}
                  onChange={handleRateChange(setAnnualReturnRate)}
                  min="0"
                  max="50"
                  step="0.1"
                />
              </div>
              
              <div className="parameter-input">
                <label htmlFor="advisor-fee">Financial Advisor Fee (%)</label>
                <input
                  id="advisor-fee"
                  type="number"
                  value={advisorFeeRate * 100}
                  onChange={handleRateChange(setAdvisorFeeRate)}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              
              <div className="parameter-input">
                <label htmlFor="fund-cost">Fund Cost (%)</label>
                <input
                  id="fund-cost"
                  type="number"
                  value={fundCostRate * 100}
                  onChange={handleRateChange(setFundCostRate)}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Full-width Impact Summary Section */}
        <section className="impact-section full-width">
          <h2>Fee Impact Summary</h2>
          
          {/* Investment Overview */}
          <h3 className="impact-subheading">Investment Overview</h3>
          <div className="impact-grid">
            <div className="impact-card">
              <h3>Total Investment</h3>
              <p className="impact-value">{formatCurrency(totalInvestment)}</p>
              <p className="impact-note">Total amount invested over {years} years</p>
            </div>
            
            <div className="impact-card">
              <h3>Total Potential Value</h3>
              <p className="impact-value">{formatCurrency(wealth.withoutFees)}</p>
              <p className="impact-note">Value without any fees</p>
            </div>
            
            <div className="impact-card">
              <h3>Total Potential Profit</h3>
              <p className="impact-value">{formatCurrency(totalPotentialProfit)}</p>
              <p className="impact-note">Profit without any fees</p>
            </div>
            
            <div className="impact-card">
              <h3>Your Actual Value</h3>
              <p className="impact-value">{formatCurrency(wealth.withAllFees)}</p>
              <p className="impact-note">Final value after all fees</p>
            </div>
          </div>
          
          {/* Impact on Profits */}
          <h3 className="impact-subheading">Impact on Profits</h3>
          <div className="impact-grid">
            <div className="impact-card">
              <h3>Fund Profit Take</h3>
              <p className="impact-value">{formatCurrency(fundProfit)}</p>
              <p className="impact-difference">
                Takes {fundProfitPercentage.toFixed(1)}% of potential profit
              </p>
            </div>
            
            <div className="impact-card">
              <h3>Advisor Profit Take</h3>
              <p className="impact-value">{formatCurrency(advisorProfit)}</p>
              <p className="impact-difference">
                Takes {advisorProfitPercentage.toFixed(1)}% of potential profit
              </p>
            </div>
            
            <div className="impact-card">
              <h3>Total Fees Paid</h3>
              <p className="impact-value">{formatCurrency(totalFeesPaid)}</p>
              <p className="impact-difference">
                {(fundProfitPercentage + advisorProfitPercentage).toFixed(1)}% of potential profit
              </p>
            </div>
            
            <div className="impact-card">
              <h3>Your Actual Profit</h3>
              <p className="impact-value">{formatCurrency(investorProfit)}</p>
              <p className="impact-difference">
                You keep {investorProfitPercentage.toFixed(1)}% of potential profit
              </p>
            </div>
          </div>
          
          {/* Impact on Total Value */}
          <h3 className="impact-subheading">Impact on Total Value</h3>
          <div className="impact-grid">
            <div className="impact-card">
              <h3>Fund Impact</h3>
              <p className="impact-value">{fundImpactOnTotal.toFixed(1)}%</p>
              <p className="impact-note">
                {formatCurrency(fundProfit)} of total potential value
              </p>
            </div>
            
            <div className="impact-card">
              <h3>Advisor Impact</h3>
              <p className="impact-value">{advisorImpactOnTotal.toFixed(1)}%</p>
              <p className="impact-note">
                {formatCurrency(advisorProfit)} of total potential value
              </p>
            </div>
            
            <div className="impact-card">
              <h3>Total Fee Impact</h3>
              <p className="impact-value">{totalFeesImpactOnTotal.toFixed(1)}%</p>
              <p className="impact-note">
                {formatCurrency(totalFeesPaid)} of total potential value
              </p>
            </div>
            
            <div className="impact-card">
              <h3>Your Portion</h3>
              <p className="impact-value">{investorPortionOfTotal.toFixed(1)}%</p>
              <p className="impact-note">
                {formatCurrency(wealth.withAllFees)} of total potential value
              </p>
            </div>
          </div>
        </section>

        {/* Full-width Gauges Section */}
        <section className="gauges-section full-width">
          <h2>Impact Gauges</h2>
          <div className="gauges-grid">
            <GaugeChart
              value={monthlyContribution}
              min={0}
              max={5000}
              unit="£"
              title="Monthly Contribution"
              description="Amount invested each month"
              colors={['#4caf50']}
            />
            
            <GaugeChart
              value={annualReturnRate}
              min={0}
              max={0.1}
              unit="%"
              title="Annual Return Rate"
              description="Expected annual investment return"
              colors={['#2196f3']}
            />
            
            <GaugeChart
              value={advisorFeeRate}
              min={0}
              max={0.05}
              unit="%"
              title="Advisor Fee"
              description="Annual fee charged by financial advisor"
              colors={['#ff9800']}
            />
            
            <GaugeChart
              value={fundCostRate}
              min={0}
              max={0.04}
              unit="%"
              title="Fund Cost"
              description="Annual fund management cost"
              colors={['#f44336']}
            />
          </div>
        </section>
        
        {/* Audit Table Section - Always Visible */}
        <section className="audit-section full-width">
          <div className="audit-header">
            <h2>Calculation Audit</h2>
          </div>
          
          <div className="audit-summary">
            <h3>Summary of Calculations</h3>
            <div className="audit-summary-content">
              <p><strong>Monthly Contribution:</strong> {formatCurrency(monthlyContribution)}</p>
              <p><strong>Investment Period:</strong> {years} years ({years * 12} months)</p>
              <p><strong>Annual Return Rate:</strong> {(annualReturnRate * 100).toFixed(2)}%</p>
              <p><strong>Monthly Return Rate:</strong> {(Math.pow(1 + annualReturnRate, 1/12) - 1).toFixed(4)}%</p>
              <p><strong>Advisor Fee (Annual):</strong> {(advisorFeeRate * 100).toFixed(2)}%</p>
              <p><strong>Fund Cost (Annual):</strong> {(fundCostRate * 100).toFixed(2)}%</p>
            </div>
          </div>
          
          <div className="audit-table-container">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Contribution</th>
                  <th>Value (No Fees)</th>
                  <th>Return</th>
                  <th>Fund Fee</th>
                  <th>Value (Fund Fees Only)</th>
                  <th>Advisor Fee</th>
                  <th>Value (All Fees)</th>
                </tr>
              </thead>
              <tbody>
                {generateMonthlyData().map(data => (
                  <tr key={data.month}>
                    <td>{data.month}</td>
                    <td>{formatCurrency(data.contribution)}</td>
                    <td>{formatCurrency(data.withoutFees)}</td>
                    <td>{formatCurrency(data.returnNoFees)}</td>
                    <td>{formatCurrency(data.fundFee)}</td>
                    <td>{formatCurrency(data.withAdvisorFees)}</td>
                    <td>{formatCurrency(data.advisorFee)}</td>
                    <td>{formatCurrency(data.withAllFees)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <p className="audit-note">
              {years > 3 ? 
                `Note: For readability, only the first 36 months (3 years) are shown. The final values are calculated using all ${years * 12} months.` :
                `All ${years * 12} months are shown in the table above.`
              }
            </p>
            
            <div className="audit-calculations">
              <h3>Formula Details</h3>
              <p><strong>No Fees:</strong> Each month adds contribution + (current value × monthly return rate)</p>
              <p><strong>Fund Fees Only:</strong> Each month adds contribution + (current value × (monthly return rate - monthly fund cost rate))</p>
              <p><strong>All Fees:</strong> Each month adds contribution + (current value × (monthly return rate - monthly fund cost rate)) - advisor fee</p>
              <p><strong>Advisor Fee:</strong> Calculated as (current month's value after return and fund fee) × (advisor fee rate / 12)</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
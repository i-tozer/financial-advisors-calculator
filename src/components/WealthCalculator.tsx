// Utility functions for wealth calculations

interface WealthParams {
  monthlyContribution: number;
  years: number;
  annualReturnRate: number;
  advisorFeeRate: number;
  fundCostRate: number;
}

export const calculateWealthAccumulation = (params: WealthParams): {
  withoutFees: number;
  withAdvisorFees: number;
  withAllFees: number;
} => {
  const { 
    monthlyContribution, 
    years, 
    annualReturnRate, 
    advisorFeeRate, 
    fundCostRate 
  } = params;

  const monthlyReturnRate = Math.pow(1 + annualReturnRate, 1/12) - 1;
  const monthlyAdvisorFeeRate = Math.pow(1 + advisorFeeRate, 1/12) - 1;
  const monthlyFundCostRate = Math.pow(1 + fundCostRate, 1/12) - 1;
  
  const totalMonths = years * 12;
  
  // Without any fees
  let wealthWithoutFees = 0;
  
  // With fund fees only (no advisor fees)
  let wealthWithFundFees = 0;
  
  // With all fees (fund fees first, then advisor fees)
  let wealthWithAllFees = 0;
  
  for (let month = 1; month <= totalMonths; month++) {
    // Add monthly contribution
    wealthWithoutFees += monthlyContribution;
    wealthWithFundFees += monthlyContribution;
    wealthWithAllFees += monthlyContribution;
    
    // Apply returns without any fees
    wealthWithoutFees *= (1 + monthlyReturnRate);
    
    // Apply returns minus fund fees only
    wealthWithFundFees *= (1 + monthlyReturnRate - monthlyFundCostRate);
    
    // Apply returns minus fund fees, then apply advisor fees on the post-fund-fee amount
    wealthWithAllFees *= (1 + monthlyReturnRate - monthlyFundCostRate); // Apply return and subtract fund fees
    wealthWithAllFees *= (1 - monthlyAdvisorFeeRate / (1 + monthlyReturnRate - monthlyFundCostRate)); // Apply advisor fee on resulting amount
  }
  
  return {
    withoutFees: Math.round(wealthWithoutFees),
    withAdvisorFees: Math.round(wealthWithFundFees), // Renamed but keeping API compatibility
    withAllFees: Math.round(wealthWithAllFees)
  };
};

// Calculate percentage impact of fees
export const calculateFeeImpact = (wealth: { 
  withoutFees: number; 
  withAdvisorFees: number; 
  withAllFees: number; 
}): {
  advisorFeeImpact: number;
  fundCostImpact: number;
  totalFeeImpact: number;
} => {
  const fundCostImpact = (wealth.withoutFees - wealth.withAdvisorFees) / wealth.withoutFees; // Impact of fund fees only
  const advisorFeeImpact = (wealth.withAdvisorFees - wealth.withAllFees) / wealth.withoutFees; // Additional impact of advisor fees
  const totalFeeImpact = (wealth.withoutFees - wealth.withAllFees) / wealth.withoutFees;
  
  return {
    advisorFeeImpact,
    fundCostImpact,
    totalFeeImpact
  };
};

// Format currency
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-GB', { 
    style: 'currency', 
    currency: 'GBP',
    maximumFractionDigits: 0
  }).format(value);
};
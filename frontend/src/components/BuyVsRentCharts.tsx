import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { BuyVsRentSummary, SensitivityResult, BuyVsRentInputs } from '../types/buyVsRent';

interface BuyVsRentChartsProps {
  analysis: BuyVsRentSummary;
  inputs?: BuyVsRentInputs;
  sensitivity?: SensitivityResult[];
  loading: boolean;
}

const BuyVsRentCharts: React.FC<BuyVsRentChartsProps> = ({ analysis, inputs, sensitivity, loading }: BuyVsRentChartsProps) => {
  // Generate cost comparison data over time (30 years)
  const generateCostComparisonData = () => {
    const data = [];
    const monthlyRent = analysis.monthly_rent_total;
    const monthlyOwnerCost = analysis.owner_cost_month1;
    // Use actual down payment from inputs, fallback to mortgage amount if not available
    const downPayment = inputs?.down_payment || analysis.mortgage_amount;
    
    // Calculate loan payoff year based on amortization rate
    const annualRate = inputs?.annual_rate || 0.04;
    const amortizationRate = inputs?.amortization_rate || 0.004;
    const mortgageAmount = analysis.mortgage_amount;
    
    // Calculate when loan is paid off using the simple formula
    let loanPayoffYear = 30; // Default to 30 years if calculation fails
    if (amortizationRate > 0) {
      // Formula: loan_term_years = 1 / amortization_rate
      loanPayoffYear = Math.ceil(1 / amortizationRate);
    }
    
    // Calculate ongoing costs after loan payoff (property tax + insurance + maintenance)
    const monthlyPropertyTax = inputs?.taxe_fonciere_monthly || 180;
    const monthlyInsurance = inputs?.insurance_monthly || 50;
    const monthlyMaintenance = (inputs?.price || 420000) * (inputs?.maintenance_pct_annual || 0.009) / 12;
    const monthlyOngoingCosts = monthlyPropertyTax + monthlyInsurance + monthlyMaintenance;
    
    for (let year = 0; year <= 30; year++) {
      const cumulativeRent = monthlyRent * 12 * year;
      
      let cumulativeOwner;
      if (year === 0) {
        // Year 0: only down payment
        cumulativeOwner = downPayment;
      } else if (year <= loanPayoffYear) {
        // During loan period: down payment + monthly owner costs
        cumulativeOwner = downPayment + (monthlyOwnerCost * 12 * year);
      } else {
        // After loan payoff: down payment + loan period costs + ongoing costs
        const loanPeriodCosts = monthlyOwnerCost * 12 * loanPayoffYear;
        const ongoingCosts = monthlyOngoingCosts * 12 * (year - loanPayoffYear);
        cumulativeOwner = downPayment + loanPeriodCosts + ongoingCosts;
      }
      
      data.push({
        year,
        rent: cumulativeRent,
        ownership: cumulativeOwner,
        savings: cumulativeRent - cumulativeOwner,
        downPayment: year === 0 ? downPayment : 0
      });
    }
    
    return data;
  };

  // Generate mortgage breakdown data over time
  const generateMortgageBreakdownData = () => {
    const data = [];
    const monthlyPayment = analysis.monthly_PI;
    const mortgageAmount = analysis.mortgage_amount;
    // Use actual interest rate from inputs, fallback to 4% if not available
    const annualRate = inputs?.annual_rate || 0.04;
    const amortizationRate = inputs?.amortization_rate || 0.004;
    
    let remainingBalance = mortgageAmount;
    
    // Calculate loan payoff year using the simple formula
    let loanPayoffYear = 30;
    if (amortizationRate > 0) {
      // Formula: loan_term_years = 1 / amortization_rate
      loanPayoffYear = Math.ceil(1 / amortizationRate);
    }
    
    for (let year = 1; year <= 30; year++) {
      let yearlyInterest = 0;
      let yearlyPrincipal = 0;
      
      // If loan is already paid off, don't show any payments
      if (remainingBalance <= 0 || year > loanPayoffYear) {
        data.push({
          year,
          interest: 0,
          principal: 0,
          totalPayment: 0,
          remainingBalance: 0
        });
        continue;
      }
      
      // Calculate monthly payments for the year
      for (let month = 1; month <= 12; month++) {
        if (remainingBalance <= 0) break;
        
        const monthlyInterest = remainingBalance * (annualRate / 12);
        const monthlyPrincipal = Math.min(monthlyPayment - monthlyInterest, remainingBalance);
        
        yearlyInterest += monthlyInterest;
        yearlyPrincipal += monthlyPrincipal;
        remainingBalance -= monthlyPrincipal;
      }
      
      data.push({
        year,
        interest: yearlyInterest,
        principal: yearlyPrincipal,
        totalPayment: yearlyInterest + yearlyPrincipal,
        remainingBalance: Math.max(0, remainingBalance)
      });
    }
    
    return data;
  };

  // Generate sensitivity analysis data
  const generateSensitivityData = () => {
    if (!sensitivity || sensitivity.length === 0) {
      return [];
    }
    
    return sensitivity.map((item: SensitivityResult, index: number) => ({
      scenario: `S${index + 1}`,
      rate: item.rate,
      rent: item.rent,
      annualSaving: item.annual_saving,
      breakEvenYears: item.break_even_years || 0,
      ownerCost: item.owner_cost_m1
    }));
  };

  const costComparisonData = generateCostComparisonData();
  const mortgageBreakdownData = generateMortgageBreakdownData();
  const sensitivityData = generateSensitivityData();

  const COLORS = ['#1976d2', '#dc004e', '#2e7d32', '#f57c00', '#7b1fa2'];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Interactive Charts
      </Typography>
      
      <Grid container spacing={3}>
        {/* Cost Comparison Over Time */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Cost Comparison Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `€${Number(value).toLocaleString()}`, 
                      name === 'rent' ? 'Rent' : name === 'ownership' ? 'Ownership (incl. down payment)' : 'Savings'
                    ]}
                    labelFormatter={(label: any) => `Year ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="rent" 
                    stroke="#dc004e" 
                    strokeWidth={2}
                    name="Rent"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="ownership" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    name="Ownership (incl. down payment)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#2e7d32" 
                    strokeWidth={2}
                    name="Savings"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Break-even Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Break-even Analysis
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={costComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `€${Number(value).toLocaleString()}`, 
                      name === 'savings' ? 'Savings vs Rent' : name
                    ]}
                    labelFormatter={(label: any) => `Year ${label}`}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#2e7d32" 
                    strokeWidth={3}
                    name="Savings vs Rent"
                    dot={{ fill: '#2e7d32', strokeWidth: 2, r: 4 }}
                  />
                  {/* Add a horizontal line at y=0 to show break-even */}
                  <Line 
                    type="monotone" 
                    dataKey={() => 0} 
                    stroke="#757575" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    name="Break-even Line"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {analysis.break_even_years 
                  ? `Break-even occurs after ${analysis.break_even_years} years (including down payment)`
                  : 'No break-even point within 30 years (including down payment)'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Mortgage Breakdown */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mortgage Breakdown Over Time
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mortgageBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: any) => [
                      `€${Number(value).toLocaleString()}`, 
                      name === 'interest' ? 'Interest' : name === 'principal' ? 'Principal' : 'Total'
                    ]}
                    labelFormatter={(label: any) => `Year ${label}`}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="interest" 
                    stackId="1" 
                    stroke="#dc004e" 
                    fill="#dc004e" 
                    fillOpacity={0.6}
                    name="Interest"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="principal" 
                    stackId="1" 
                    stroke="#2e7d32" 
                    fill="#2e7d32" 
                    fillOpacity={0.6}
                    name="Principal"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sensitivity Analysis */}
        {sensitivityData.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Sensitivity Analysis
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <ScatterChart data={sensitivityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="rate" 
                      name="Interest Rate"
                      label={{ value: 'Interest Rate (%)', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      dataKey="annualSaving" 
                      name="Annual Savings"
                      label={{ value: 'Annual Savings (€)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      formatter={(value: any, name: any) => [
                        name === 'rate' ? `${value}%` : `€${Number(value).toLocaleString()}`,
                        name === 'rate' ? 'Interest Rate' : 'Annual Savings'
                      ]}
                      labelFormatter={(label: any, payload: any) => {
                        if (payload && payload[0]) {
                          const data = payload[0].payload;
                          return `Rate: ${data.rate}%, Rent: €${data.rent.toLocaleString()}`;
                        }
                        return '';
                      }}
                    />
                    <Scatter dataKey="annualSaving" fill="#1976d2">
                      {sensitivityData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Summary Metrics */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="primary">
                      €{analysis.monthly_rent_total.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Rent
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      €{analysis.owner_cost_month1.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Monthly Ownership Cost
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={analysis.annual_saving_vs_rent > 0 ? "success.main" : "error.main"}>
                      €{analysis.annual_saving_vs_rent.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Annual Savings vs Rent
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="text.primary">
                      {analysis.break_even_years || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Break-even Years
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BuyVsRentCharts;

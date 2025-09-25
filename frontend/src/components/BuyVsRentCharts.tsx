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
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { BuyVsRentSummary, SensitivityResult } from '../types/buyVsRent';

interface BuyVsRentChartsProps {
  analysis: BuyVsRentSummary;
  sensitivity?: SensitivityResult[];
  loading: boolean;
}

const BuyVsRentCharts: React.FC<BuyVsRentChartsProps> = ({ analysis, sensitivity, loading }: BuyVsRentChartsProps) => {
  // Generate cost comparison data over time (30 years)
  const generateCostComparisonData = () => {
    const data = [];
    const monthlyRent = analysis.monthly_rent_total;
    const monthlyOwnerCost = analysis.owner_cost_month1;
    
    for (let year = 1; year <= 30; year++) {
      const cumulativeRent = monthlyRent * 12 * year;
      const cumulativeOwner = monthlyOwnerCost * 12 * year;
      
      data.push({
        year,
        rent: cumulativeRent,
        ownership: cumulativeOwner,
        savings: cumulativeRent - cumulativeOwner
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
                      name === 'rent' ? 'Rent' : name === 'ownership' ? 'Ownership' : 'Savings'
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
                    name="Ownership"
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
                <BarChart data={[
                  { 
                    category: 'Break-even', 
                    years: analysis.break_even_years || 0,
                    color: analysis.break_even_years ? '#2e7d32' : '#dc004e'
                  }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis label={{ value: 'Years', angle: -90, position: 'insideLeft' }} />
                  <Tooltip 
                    formatter={(value: any) => [
                      `${value} years`, 
                      'Break-even Point'
                    ]}
                  />
                  <Bar dataKey="years" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {analysis.break_even_years 
                  ? `Break-even occurs after ${analysis.break_even_years} years`
                  : 'No break-even point within reasonable timeframe'
                }
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Sensitivity Analysis */}
        {sensitivityData.length > 0 && (
          <Grid item xs={12}>
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
                      {sensitivityData.map((entry, index) => (
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

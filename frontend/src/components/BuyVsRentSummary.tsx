import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Alert,
} from '@mui/material';
import { TrendingUp, TrendingDown, Home, Euro } from '@mui/icons-material';
import { BuyVsRentSummary as BuyVsRentSummaryType, BuyVsRentInputs } from '../types/buyVsRent';

interface BuyVsRentSummaryProps {
  analysis: BuyVsRentSummaryType;
  inputs?: BuyVsRentInputs | null;
}

const BuyVsRentSummary: React.FC<BuyVsRentSummaryProps> = ({ analysis, inputs }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const isOwningBetter = analysis.annual_saving_vs_rent > 0;
  const breakEvenExists = analysis.break_even_years !== null;

  const summaryCards = [
    // First row - Property and financing
    {
      title: 'Property Price',
      value: formatCurrency(analysis.property_price),
      icon: <Home sx={{ color: 'primary.main' }} />,
      color: '#e3f2fd',
    },
    {
      title: 'Total Acquisition Cost',
      value: formatCurrency(analysis.total_acquisition_cost),
      icon: <Euro sx={{ color: 'info.main' }} />,
      color: '#e0f2f1',
    },
    {
      title: 'Credit Borrowed',
      value: formatCurrency(analysis.mortgage_amount),
      icon: <TrendingUp sx={{ color: 'warning.main' }} />,
      color: '#fff3e0',
    },
    {
      title: 'Total Interest Paid',
      value: formatCurrency(analysis.total_interest_paid),
      icon: <TrendingUp sx={{ color: 'error.main' }} />,
      color: '#ffebee',
    },
    {
      title: 'Owner Equity After Fees (30y)',
      value: formatCurrency(analysis.house_wealth_30_years - (analysis.total_acquisition_cost - analysis.property_price)),
      icon: <Home sx={{ color: 'success.main' }} />,
      color: '#e8f5e8',
    },
    // Second row - Monthly costs
    {
      title: 'Monthly Credit Repayment',
      value: formatCurrency(analysis.monthly_PI),
      icon: <TrendingUp sx={{ color: 'warning.main' }} />,
      color: '#fff3e0',
    },
    {
      title: 'Monthly Owner Cost (Year 1)',
      value: formatCurrency(analysis.owner_cost_month1),
      icon: <TrendingDown sx={{ color: 'secondary.main' }} />,
      color: '#fce4ec',
    },
    {
      title: 'Monthly Rent Cost',
      value: formatCurrency(analysis.monthly_rent_total),
      icon: <TrendingDown sx={{ color: 'error.main' }} />,
      color: '#f3e5f5',
    },
  ];

  // Determine baseline mode from inputs (default to pure_renter if not available)
  const baselineMode = inputs?.baseline_mode || 'pure_renter';
  
  const getAlternativeWealthLabel = (years: number) => {
    if (baselineMode === 'pure_renter') {
      return `Pure Renter Wealth (${years} years)`;
    } else if (baselineMode === 'budget_matched') {
      return `Budget-Matched Wealth (${years} years)`;
    } else {
      return `Alternative Wealth (${years} years)`;
    }
  };

  const wealthSummaryCards = [
    {
      title: 'House Wealth (10 years)',
      value: formatCurrency(analysis.house_wealth_10_years),
      icon: <Home sx={{ color: 'primary.main' }} />,
      color: '#e3f2fd',
    },
    {
      title: getAlternativeWealthLabel(10),
      value: formatCurrency(analysis.investment_wealth_10_years),
      icon: <TrendingUp sx={{ color: 'success.main' }} />,
      color: '#e8f5e8',
    },
    {
      title: 'House Wealth (20 years)',
      value: formatCurrency(analysis.house_wealth_20_years),
      icon: <Home sx={{ color: 'primary.main' }} />,
      color: '#e3f2fd',
    },
    {
      title: getAlternativeWealthLabel(20),
      value: formatCurrency(analysis.investment_wealth_20_years),
      icon: <TrendingUp sx={{ color: 'success.main' }} />,
      color: '#e8f5e8',
    },
    {
      title: 'House Wealth (30 years)',
      value: formatCurrency(analysis.house_wealth_30_years),
      icon: <Home sx={{ color: 'primary.main' }} />,
      color: '#e3f2fd',
    },
    {
      title: getAlternativeWealthLabel(30),
      value: formatCurrency(analysis.investment_wealth_30_years),
      icon: <TrendingUp sx={{ color: 'success.main' }} />,
      color: '#e8f5e8',
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Analysis Summary
        </Typography>
        <Chip 
          label={`Baseline: ${baselineMode === 'pure_renter' ? 'Pure Renter' : 'Budget-Matched'}`}
          color={baselineMode === 'pure_renter' ? 'primary' : 'secondary'}
          size="small"
        />
      </Box>

      {/* First row - Property and financing */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {summaryCards.slice(0, 4).map((card, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card sx={{ height: '100%', backgroundColor: card.color }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ mb: 1 }}>
                  {card.icon}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Second row - Monthly costs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.slice(4).map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index + 4}>
            <Card sx={{ height: '100%', backgroundColor: card.color }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ mb: 1 }}>
                  {card.icon}
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {card.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Cost Explanation */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Cost Breakdown
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            <strong>Monthly Credit Repayment:</strong> Full mortgage payment (principal + interest) - this is what you pay to the bank<br/>
            <strong>Monthly Owner Cost (Year 1):</strong> Only the "economic cost" (interest + taxes + insurance + maintenance) - excludes principal because it builds equity<br/>
            <br/>
            <em>Why is Owner Cost lower? The principal payment builds equity (you're paying yourself), so it's not considered a "cost" in economic analysis.</em>
          </Typography>
        </CardContent>
      </Card>

      {/* Wealth Comparison Summary */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Wealth Comparison Over Time
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {wealthSummaryCards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ height: '100%', backgroundColor: card.color }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Box sx={{ mb: 1 }}>
                      {card.icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {card.value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {analysis.wealth_crossover_year && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>Wealth Crossover Point:</strong> Investment strategy overtakes house wealth in year {analysis.wealth_crossover_year}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Key Insights
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="body1">
              <strong>Annual Savings vs Rent:</strong>
            </Typography>
            <Chip
              icon={isOwningBetter ? <TrendingUp /> : <TrendingDown />}
              label={formatCurrency(Math.abs(analysis.annual_saving_vs_rent))}
              color={isOwningBetter ? 'success' : 'error'}
              variant="filled"
            />
            <Typography variant="body2" color="text.secondary">
              {isOwningBetter ? 'Owning is cheaper' : 'Renting is cheaper'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Cash Payback */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">
                <strong>Cash Payback:</strong>
              </Typography>
              {breakEvenExists ? (
                <>
                  <Chip
                    label={`${formatNumber(analysis.break_even_years!)} years`}
                    color="info"
                    variant="outlined"
                  />
                  <Typography variant="body2" color="text.secondary">
                    Time to recover upfront costs (DP + fees)
                  </Typography>
                </>
              ) : (
                <Chip
                  label="Never"
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>
            
            {/* Wealth Breakeven */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body1">
                <strong>Wealth Breakeven:</strong>
              </Typography>
              <Chip
                label="~2 years"
                color="success"
                variant="outlined"
              />
              <Typography variant="body2" color="text.secondary">
                When net advantage becomes positive
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Loan Details */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Loan Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">
                  <strong>Calculated Loan Term:</strong>
                </Typography>
                <Chip
                  label={`${formatNumber(analysis.calculated_loan_term_years, 1)} years`}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body1">
                  <strong>Yearly Amortization Rate:</strong>
                </Typography>
                <Chip
                  label={`${(analysis.yearly_amortization_rate * 100).toFixed(2)}%`}
                  color="secondary"
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Based on your amortization rate of {(analysis.yearly_amortization_rate * 100).toFixed(2)}% per year, 
            the loan will be paid off in approximately {formatNumber(analysis.calculated_loan_term_years, 1)} years.
          </Typography>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Monthly Cost Comparison
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2" color="text.secondary">
                Owner Cost (Year 1)
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatCurrency(analysis.owner_cost_month1)}
              </Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Monthly Difference (Owner - Rent)
              </Typography>
              <Chip
                icon={analysis.owner_vs_rent_monthly > 0 ? <TrendingUp /> : <TrendingDown />}
                label={formatCurrency(analysis.owner_vs_rent_monthly)}
                color={analysis.owner_vs_rent_monthly > 0 ? 'error' : 'success'}
                variant="filled"
              />
            </Box>
            
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="body2" color="text.secondary">
                Rent Cost
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatCurrency(analysis.monthly_rent_total)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BuyVsRentSummary;

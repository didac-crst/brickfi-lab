import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { TrendingUp, TrendingDown, Home, Euro } from '@mui/icons-material';
import { BuyVsRentSummary as BuyVsRentSummaryType } from '../types/buyVsRent';

interface BuyVsRentSummaryProps {
  analysis: BuyVsRentSummaryType;
}

const BuyVsRentSummary: React.FC<BuyVsRentSummaryProps> = ({ analysis }) => {
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
    {
      title: 'Mortgage Amount',
      value: formatCurrency(analysis.mortgage_amount),
      icon: <Euro sx={{ color: 'primary.main' }} />,
      color: '#e3f2fd',
    },
    {
      title: 'Monthly P&I Payment',
      value: formatCurrency(analysis.monthly_PI),
      icon: <Home sx={{ color: 'info.main' }} />,
      color: '#e0f2f1',
    },
    {
      title: 'Monthly Owner Cost',
      value: formatCurrency(analysis.owner_cost_month1),
      icon: <TrendingUp sx={{ color: 'warning.main' }} />,
      color: '#fff3e0',
    },
    {
      title: 'Monthly Rent Cost',
      value: formatCurrency(analysis.monthly_rent_total),
      icon: <TrendingDown sx={{ color: 'secondary.main' }} />,
      color: '#fce4ec',
    },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
        Analysis Summary
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {summaryCards.map((card, index) => (
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

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              <strong>Break-even Point:</strong>
            </Typography>
            {breakEvenExists ? (
              <>
                <Chip
                  label={`${formatNumber(analysis.break_even_years!)} years`}
                  color="info"
                  variant="outlined"
                />
                <Typography variant="body2" color="text.secondary">
                  Time to recover upfront costs
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
                Monthly Difference
              </Typography>
              <Chip
                icon={analysis.owner_vs_rent_monthly > 0 ? <TrendingUp /> : <TrendingDown />}
                label={formatCurrency(Math.abs(analysis.owner_vs_rent_monthly))}
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

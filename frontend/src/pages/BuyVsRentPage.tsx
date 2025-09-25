import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Refresh, TrendingUp, TrendingDown, Download } from '@mui/icons-material';
import BuyVsRentForm from '../components/BuyVsRentForm';
import BuyVsRentCharts from '../components/BuyVsRentCharts';
import BuyVsRentSummary from '../components/BuyVsRentSummary';
import { useBuyVsRentAnalysis } from '../hooks/useBuyVsRentAnalysis';
import { BuyVsRentInputs } from '../types/buyVsRent';

const BuyVsRentPage: React.FC = () => {
  const [inputs, setInputs] = useState<BuyVsRentInputs | null>(null);
  const { analysis, sensitivity, loading, error, analyze, runSensitivity } = useBuyVsRentAnalysis();

  const handleInputsChange = (newInputs: BuyVsRentInputs) => {
    setInputs(newInputs);
    analyze(newInputs);
  };

  const handleSensitivityAnalysis = () => {
    if (inputs) {
      // Create rate range around the current rate (±1%)
      const baseRate = inputs.annual_rate;
      const rates = [
        Math.max(0.01, baseRate - 0.02), // -2%
        Math.max(0.01, baseRate - 0.01), // -1%
        baseRate, // current
        baseRate + 0.01, // +1%
        baseRate + 0.02  // +2%
      ];
      
      // Create rent range around current rent (±20%)
      const baseRent = inputs.monthly_rent;
      const rents = [
        Math.round(baseRent * 0.8), // -20%
        Math.round(baseRent * 0.9), // -10%
        baseRent, // current
        Math.round(baseRent * 1.1), // +10%
        Math.round(baseRent * 1.2)  // +20%
      ];
      
      runSensitivity(inputs, rates, rents);
    }
  };

  const exportAnalysisForLLM = () => {
    if (!inputs || !analysis) return;
    
    const exportData = {
      analysis_type: "Buy vs Rent Property Analysis",
      description: "Complete analysis comparing the costs of buying versus renting a property, including sensitivity analysis across different interest rates and rental prices.",
      timestamp: new Date().toISOString(),
      inputs: {
        description: "User input parameters for the property analysis",
        property_details: {
          price: inputs.price,
          description: "Purchase price of the property in euros"
        },
        financial_parameters: {
          fees_pct: inputs.fees_pct,
          fees_pct_description: "Upfront purchase costs as percentage of property price (notary, registration, etc.)",
          down_payment: inputs.down_payment,
          down_payment_description: "Cash payment toward the purchase price in euros",
          annual_rate: inputs.annual_rate,
          annual_rate_description: "Fixed mortgage nominal annual interest rate",
          term_years: inputs.term_years,
          term_years_description: "Mortgage loan term in years"
        },
        monthly_costs: {
          monthly_rent: inputs.monthly_rent,
          monthly_rent_description: "Comparable market rental price per month in euros",
          taxe_fonciere_monthly: inputs.taxe_fonciere_monthly,
          taxe_fonciere_description: "Monthly property tax equivalent in euros",
          insurance_monthly: inputs.insurance_monthly,
          insurance_description: "Borrower/homeowner insurance monthly cost in euros",
          maintenance_pct_annual: inputs.maintenance_pct_annual,
          maintenance_description: "Annual maintenance costs as percentage of property price",
          renter_insurance_monthly: inputs.renter_insurance_monthly,
          renter_insurance_description: "Optional renter insurance monthly cost in euros"
        }
      },
      results: {
        description: "Analysis results comparing ownership vs rental costs",
        mortgage_details: {
          mortgage_amount: analysis.mortgage_amount,
          mortgage_amount_description: "Total loan amount after down payment in euros",
          monthly_PI: analysis.monthly_PI,
          monthly_PI_description: "Monthly principal and interest payment in euros"
        },
        cost_comparison: {
          owner_cost_month1: analysis.owner_cost_month1,
          owner_cost_description: "Total monthly cost of ownership (excluding principal) in first month",
          monthly_rent_total: analysis.monthly_rent_total,
          rent_cost_description: "Total monthly rental cost including insurance",
          owner_vs_rent_monthly: analysis.owner_vs_rent_monthly,
          monthly_difference_description: "Monthly cost difference (positive means ownership costs more)"
        },
        financial_metrics: {
          annual_saving_vs_rent: analysis.annual_saving_vs_rent,
          annual_saving_description: "Annual savings compared to renting (negative means renting is cheaper)",
          break_even_years: analysis.break_even_years,
          break_even_description: "Years until ownership becomes financially advantageous (considering equity building)"
        }
      },
      sensitivity_analysis: sensitivity ? {
        description: "Sensitivity analysis showing how results vary with different interest rates and rental prices",
        scenarios: sensitivity.map(result => ({
          interest_rate: result.rate,
          rental_price: result.rent,
          owner_cost_m1: result.owner_cost_m1,
          annual_saving: result.annual_saving,
          break_even_years: result.break_even_years,
          scenario_description: `Scenario with ${(result.rate * 100).toFixed(2)}% interest rate and €${result.rent}/month rent`
        }))
      } : null,
      interpretation: {
        summary: analysis.annual_saving_vs_rent >= 0 
          ? "Based on this analysis, renting appears more cost-effective in the short term."
          : "Based on this analysis, buying appears more cost-effective than renting.",
        key_factors: [
          "This analysis focuses on first-year costs and does not include equity building from mortgage principal payments",
          "Break-even calculation considers when equity gains offset higher ownership costs",
          "Property appreciation/depreciation is not included in this analysis",
          "Tax benefits of homeownership may not be fully captured"
        ]
      }
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buy-vs-rent-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Buy vs Rent Analysis
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Compare the economic costs of buying vs renting a property. This analysis considers first-year ownership costs 
        (excluding principal payments) versus rental costs to help you make an informed decision.
      </Typography>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Property & Financial Details
            </Typography>
            <BuyVsRentForm 
              onInputsChange={handleInputsChange}
              loading={loading}
            />
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} lg={8}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {analysis && (
            <>
              {/* Summary Cards */}
              <BuyVsRentSummary analysis={analysis} />

              {/* Charts */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Analysis Charts
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={handleSensitivityAnalysis}
                      disabled={loading}
                    >
                      Run Sensitivity Analysis
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={exportAnalysisForLLM}
                      disabled={!analysis}
                      color="secondary"
                    >
                      Export for LLM
                    </Button>
                  </Box>
                </Box>
                
                <BuyVsRentCharts 
                  analysis={analysis} 
                  sensitivity={sensitivity || undefined}
                  loading={loading}
                />
              </Paper>
            </>
          )}

          {!analysis && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Enter property details to begin analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill out the form on the left to see your buy vs rent comparison
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BuyVsRentPage;

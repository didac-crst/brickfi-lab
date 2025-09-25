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
import { Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';
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
      const rates = [0.025, 0.03, 0.035, 0.04, 0.045];
      const rents = [1400, 1500, 1600, 1700, 1800, 1900];
      runSensitivity(inputs, rates, rents);
    }
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
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handleSensitivityAnalysis}
                    disabled={loading}
                  >
                    Run Sensitivity Analysis
                  </Button>
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

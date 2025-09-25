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
  Chip,
} from '@mui/material';
import { Refresh, TrendingUp, Lock, Schedule } from '@mui/icons-material';
import ForwardTrackerForm from '../components/ForwardTrackerForm';
import ForwardTrackerCharts from '../components/ForwardTrackerCharts';
import ForwardDecisionSummary from '../components/ForwardDecisionSummary';
import { useForwardTracker } from '../hooks/useForwardTracker';
import { ForwardDecisionInputs } from '../types/forwardTracker';

const ForwardTrackerPage: React.FC = () => {
  const [inputs, setInputs] = useState<ForwardDecisionInputs | null>(null);
  const { 
    decision, 
    premiumSchedule, 
    loading, 
    error, 
    makeDecision, 
    analyzePremiumSchedule 
  } = useForwardTracker();

  const handleInputsChange = (newInputs: ForwardDecisionInputs) => {
    setInputs(newInputs);
    makeDecision(newInputs);
  };

  const handlePremiumAnalysis = () => {
    if (inputs) {
      analyzePremiumSchedule(inputs, 36);
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'LOCK_10Y':
        return 'success';
      case 'TAKE_5Y':
        return 'info';
      case 'WAIT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'LOCK_10Y':
        return <Lock />;
      case 'TAKE_5Y':
        return <TrendingUp />;
      case 'WAIT':
        return <Schedule />;
      default:
        return undefined;
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Forward Rate Tracker
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Analyze forward-loaded mortgage rates and make optimal timing decisions for refinancing. 
        This tool helps you decide when to lock rates based on forward premiums and your risk tolerance.
      </Typography>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Market Conditions & Rules
            </Typography>
            <ForwardTrackerForm 
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

          {decision && (
            <>
              {/* Decision Summary */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Decision Recommendation
                  </Typography>
                  <Chip
                    icon={getDecisionIcon(decision.decision)}
                    label={decision.decision}
                    color={getDecisionColor(decision.decision) as any}
                    variant="filled"
                    size="medium"
                  />
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {decision.reason}
                </Typography>
                <ForwardDecisionSummary decision={decision} />
              </Paper>

              {/* Charts */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Analysis Charts
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={handlePremiumAnalysis}
                    disabled={loading}
                  >
                    Analyze Premium Schedule
                  </Button>
                </Box>
                
                <ForwardTrackerCharts 
                  decision={decision} 
                  premiumSchedule={premiumSchedule || undefined}
                  loading={loading}
                />
              </Paper>
            </>
          )}

          {!decision && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Enter market conditions to begin analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill out the form on the left to see your forward rate decision recommendation
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForwardTrackerPage;

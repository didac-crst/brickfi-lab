import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { ForwardDecisionResult } from '../types/forwardTracker';

interface ForwardDecisionSummaryProps {
  decision: ForwardDecisionResult;
}

const ForwardDecisionSummary: React.FC<ForwardDecisionSummaryProps> = ({ decision }) => {
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Decision Details
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Forward-Loaded 10Y Rate
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatPercentage(decision.forward_10y_rate)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Lead Time
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {decision.diagnostics.lead_months} months
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Forward Premium
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {formatPercentage(decision.diagnostics.premium_pp)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Small Loan Surcharge
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {decision.diagnostics.small_loan_surcharge_bp} bps
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForwardDecisionSummary;

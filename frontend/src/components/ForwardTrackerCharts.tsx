import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { ForwardDecisionResult, PremiumScheduleAnalysis } from '../types/forwardTracker';

interface ForwardTrackerChartsProps {
  decision: ForwardDecisionResult;
  premiumSchedule?: PremiumScheduleAnalysis;
  loading: boolean;
}

const ForwardTrackerCharts: React.FC<ForwardTrackerChartsProps> = ({ decision, premiumSchedule, loading }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Forward Rate Analysis Charts
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center', minHeight: 300 }}>
        <Typography variant="body1" color="text.secondary">
          Charts will be implemented here using Recharts library
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          - Forward rate progression over time
        </Typography>
        <Typography variant="body2" color="text.secondary">
          - Premium schedule visualization
        </Typography>
        <Typography variant="body2" color="text.secondary">
          - Decision trigger points
        </Typography>
      </Paper>
    </Box>
  );
};

export default ForwardTrackerCharts;

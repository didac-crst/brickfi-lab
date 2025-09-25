import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { BuyVsRentSummary, SensitivityResult } from '../types/buyVsRent';

interface BuyVsRentChartsProps {
  analysis: BuyVsRentSummary;
  sensitivity?: SensitivityResult[];
  loading: boolean;
}

const BuyVsRentCharts: React.FC<BuyVsRentChartsProps> = ({ analysis, sensitivity, loading }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Interactive Charts
      </Typography>
      <Paper sx={{ p: 3, textAlign: 'center', minHeight: 300 }}>
        <Typography variant="body1" color="text.secondary">
          Charts will be implemented here using Recharts library
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          - Cost comparison over time
        </Typography>
        <Typography variant="body2" color="text.secondary">
          - Sensitivity analysis heatmap
        </Typography>
        <Typography variant="body2" color="text.secondary">
          - Break-even analysis
        </Typography>
      </Paper>
    </Box>
  );
};

export default BuyVsRentCharts;

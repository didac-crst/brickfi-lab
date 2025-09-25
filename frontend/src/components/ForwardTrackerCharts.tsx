import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Chip } from '@mui/material';
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
  AreaChart,
  Area
} from 'recharts';
import { ForwardDecisionResult, PremiumScheduleAnalysis } from '../types/forwardTracker';

interface ForwardTrackerChartsProps {
  decision: ForwardDecisionResult;
  premiumSchedule?: PremiumScheduleAnalysis;
  loading: boolean;
}

const ForwardTrackerCharts: React.FC<ForwardTrackerChartsProps> = ({ decision, premiumSchedule, loading }: ForwardTrackerChartsProps) => {
  // Generate forward rate progression data
  const generateForwardRateData = () => {
    if (!premiumSchedule) {
      return [];
    }
    
    return premiumSchedule.months.map((month: number, index: number) => ({
      month,
      forwardRate: premiumSchedule.forward_rates[index],
      premium: premiumSchedule.premiums[index],
      decision: premiumSchedule.decisions[index]
    }));
  };

  // Generate diagnostics data for visualization
  const generateDiagnosticsData = () => {
    if (!decision.diagnostics) {
      return [];
    }
    
    return Object.entries(decision.diagnostics).map(([key, value]) => ({
      metric: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: value,
      color: value > 0 ? '#2e7d32' : value < 0 ? '#dc004e' : '#1976d2'
    }));
  };

  const forwardRateData = generateForwardRateData();
  const diagnosticsData = generateDiagnosticsData();

  const getDecisionColor = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'lock':
        return '#2e7d32';
      case 'wait':
        return '#f57c00';
      case 'consider':
        return '#1976d2';
      default:
        return '#757575';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Forward Rate Analysis Charts
      </Typography>
      
      <Grid container spacing={3}>
        {/* Decision Summary */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  Decision Recommendation
                </Typography>
                <Chip 
                  label={decision.decision.toUpperCase()} 
                  color={decision.decision.toLowerCase() === 'lock' ? 'success' : 
                         decision.decision.toLowerCase() === 'wait' ? 'warning' : 'primary'}
                  variant="filled"
                />
              </Box>
              <Typography variant="body1" color="text.secondary">
                {decision.reason}
              </Typography>
              <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                Forward 10Y Rate: {decision.forward_10y_rate.toFixed(3)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Forward Rate Progression */}
        {forwardRateData.length > 0 && (
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Forward Rate Progression Over Time
                </Typography>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={forwardRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="month" 
                      label={{ value: 'Months', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any, name: any) => [
                        `${Number(value).toFixed(3)}%`, 
                        name === 'forwardRate' ? 'Forward Rate' : 'Premium'
                      ]}
                      labelFormatter={(label: any) => `Month ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="forwardRate" 
                      stroke="#1976d2" 
                      strokeWidth={3}
                      name="Forward Rate"
                      dot={{ fill: '#1976d2', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="premium" 
                      stroke="#dc004e" 
                      strokeWidth={2}
                      name="Premium"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Decision Points */}
        {forwardRateData.length > 0 && (
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Decision Points
                </Typography>
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                  {forwardRateData.map((point: any, index: number) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        py: 1,
                        borderBottom: index < forwardRateData.length - 1 ? '1px solid #e0e0e0' : 'none'
                      }}
                    >
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          Month {point.month}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {point.forwardRate.toFixed(3)}%
                        </Typography>
                      </Box>
                      <Chip 
                        label={point.decision} 
                        size="small"
                        sx={{ 
                          backgroundColor: getDecisionColor(point.decision),
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Premium Schedule Visualization */}
        {premiumSchedule && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Premium Schedule
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={forwardRateData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: any) => [`${Number(value).toFixed(2)}`, 'Premium']}
                      labelFormatter={(label: any) => `Month ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="premium" 
                      stroke="#dc004e" 
                      fill="#dc004e" 
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Diagnostics */}
        {diagnosticsData.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Decision Diagnostics
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={diagnosticsData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="metric" type="category" width={120} />
                    <Tooltip 
                      formatter={(value: any) => [Number(value).toFixed(3), 'Value']}
                    />
                    <Bar dataKey="value" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Key Metrics */}
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
                      {decision.forward_10y_rate.toFixed(3)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Forward 10Y Rate
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="secondary">
                      {premiumSchedule?.premiums[0]?.toFixed(2) || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Initial Premium
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color="text.primary">
                      {premiumSchedule?.months.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Analysis Period (Months)
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box textAlign="center">
                    <Typography variant="h4" color={getDecisionColor(decision.decision)}>
                      {decision.decision}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Recommendation
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

export default ForwardTrackerCharts;

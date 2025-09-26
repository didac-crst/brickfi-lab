import React, { useMemo } from 'react';
import { Card, CardContent, Typography, Tooltip } from '@mui/material';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
} from 'recharts';
import { PureBaselinePoint } from '../types/buyVsRent';

type Props = {
  data: PureBaselinePoint[];   // yearly series
  horizonYears?: number;       // default 30
};

const BuyVsRentWaterfall: React.FC<Props> = ({ data, horizonYears = 30 }) => {
  const point = useMemo(() => data.find(d => d.year === horizonYears) ?? data[data.length - 1], [data, horizonYears]);
  const rows = useMemo(() => {
    if (!point) return [];
    const c = point.components;
    return [
      { name: 'Leverage on Appreciation', value: c.appreciation_gain },
      { name: 'Principal Built', value: c.principal_built },
      { name: 'Interest Drag', value: c.interest_drag },
      { name: 'Opportunity Cost (DP)', value: c.opportunity_cost_dp },
      { name: 'Rent Avoided (Net)', value: c.rent_avoided_net },
      { name: 'Closing Costs', value: c.closing_costs },
    ];
  }, [point]);

  if (!point) return null;

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Buy vs Pure Renter — Component Breakdown (Year {point.year})
        </Typography>
        <Tooltip title="Net Advantage = Owner Equity - Baseline Wealth + Cashflow Gap - Closing Costs">
          <Typography variant="body2" gutterBottom sx={{ cursor: 'help' }}>
            Net Advantage = {point.net_advantage.toFixed(0)} €
          </Typography>
        </Tooltip>
        <div style={{ width: '100%', height: 360 }}>
          <ResponsiveContainer>
            <BarChart data={rows}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip formatter={(v: number) => `${v.toFixed(0)} €`} />
              <Legend />
              <Bar dataKey="value" name="Contribution (±€)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyVsRentWaterfall;

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore, Refresh } from '@mui/icons-material';
import { ForwardDecisionInputs } from '../types/forwardTracker';
import { forwardTrackerApi } from '../utils/api';

interface ForwardTrackerFormProps {
  onInputsChange: (inputs: ForwardDecisionInputs) => void;
  loading: boolean;
}

const ForwardTrackerForm: React.FC<ForwardTrackerFormProps> = ({ onInputsChange, loading }) => {
  const [inputs, setInputs] = useState<ForwardDecisionInputs>({
    spot_10y: 3.40,
    spot_5y: 3.05,
    lead_months: 18,
    loan_amount: 130000,
    rules: {
      lock_10y_le: 3.30,
      lock_10y_alt: 3.50,
      min_5y_discount_bp: 35,
      small_loan_threshold: 150000,
      small_loan_surcharge_bp: 10,
    },
    schedule: {
      free_months: 12,
      premium_pp_per_month: 0.01,
    },
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDefaultInputs();
  }, []);

  const loadDefaultInputs = async () => {
    try {
      const defaults = await forwardTrackerApi.getDefaultInputs();
      setInputs(defaults);
      onInputsChange(defaults);
    } catch (err) {
      console.error('Failed to load default inputs:', err);
    }
  };

  const handleInputChange = (field: string, value: number) => {
    const newInputs = { ...inputs };
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      (newInputs as any)[parent] = { ...(newInputs as any)[parent], [child]: value };
    } else {
      (newInputs as any)[field] = value;
    }
    
    setInputs(newInputs);
    setError(null);
  };

  const handleSubmit = () => {
    try {
      onInputsChange(inputs);
    } catch (err) {
      setError('Invalid input values');
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Market Conditions
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="10-Year Rate"
            type="number"
            value={inputs.spot_10y}
            onChange={(e) => handleInputChange('spot_10y', parseFloat(e.target.value) || 0)}
            InputProps={{
              endAdornment: '%',
            }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="5-Year Rate"
            type="number"
            value={inputs.spot_5y || ''}
            onChange={(e) => handleInputChange('spot_5y', parseFloat(e.target.value) || 0)}
            InputProps={{
              endAdornment: '%',
            }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Lead Time"
            type="number"
            value={inputs.lead_months}
            onChange={(e) => handleInputChange('lead_months', parseInt(e.target.value) || 0)}
            InputProps={{
              endAdornment: 'months',
            }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Loan Amount"
            type="number"
            value={inputs.loan_amount}
            onChange={(e) => handleInputChange('loan_amount', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: '€',
            }}
          />
        </Grid>
      </Grid>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Decision Rules
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Lock 10Y Trigger"
                type="number"
                value={inputs.rules.lock_10y_le}
                onChange={(e) => handleInputChange('rules.lock_10y_le', parseFloat(e.target.value) || 0)}
                InputProps={{
                  endAdornment: '%',
                }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Alt Lock 10Y Trigger"
                type="number"
                value={inputs.rules.lock_10y_alt}
                onChange={(e) => handleInputChange('rules.lock_10y_alt', parseFloat(e.target.value) || 0)}
                InputProps={{
                  endAdornment: '%',
                }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min 5Y Discount"
                type="number"
                value={inputs.rules.min_5y_discount_bp}
                onChange={(e) => handleInputChange('rules.min_5y_discount_bp', parseInt(e.target.value) || 0)}
                InputProps={{
                  endAdornment: 'bps',
                }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Small Loan Threshold"
                type="number"
                value={inputs.rules.small_loan_threshold}
                onChange={(e) => handleInputChange('rules.small_loan_threshold', parseFloat(e.target.value) || 0)}
                InputProps={{
                  startAdornment: '€',
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Premium Schedule
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Free Months"
                type="number"
                value={inputs.schedule.free_months}
                onChange={(e) => handleInputChange('schedule.free_months', parseInt(e.target.value) || 0)}
                InputProps={{
                  endAdornment: 'months',
                }}
              />
            </Grid>
            
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Premium per Month"
                type="number"
                value={inputs.schedule.premium_pp_per_month * 100}
                onChange={(e) => handleInputChange('schedule.premium_pp_per_month', (parseFloat(e.target.value) || 0) / 100)}
                InputProps={{
                  endAdornment: '%',
                }}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadDefaultInputs}
          disabled={loading}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default ForwardTrackerForm;

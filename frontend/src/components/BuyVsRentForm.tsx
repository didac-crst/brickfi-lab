import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Divider,
  Alert,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { BuyVsRentInputs } from '../types/buyVsRent';
import { buyVsRentApi } from '../utils/api';

interface BuyVsRentFormProps {
  onInputsChange: (inputs: BuyVsRentInputs) => void;
  loading: boolean;
}

const BuyVsRentForm: React.FC<BuyVsRentFormProps> = ({ onInputsChange, loading }) => {
  const [inputs, setInputs] = useState<BuyVsRentInputs>({
    price: 420000,
    fees_pct: 0.075,
    down_payment: 100000,
    annual_rate: 0.032,
    term_years: 25,
    monthly_rent: 1700,
    taxe_fonciere_monthly: 180,
    insurance_monthly: 50,
    maintenance_pct_annual: 0.009,
    renter_insurance_monthly: 0,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDefaultInputs();
  }, []);

  const loadDefaultInputs = async () => {
    try {
      const defaults = await buyVsRentApi.getDefaultInputs();
      setInputs(defaults);
      onInputsChange(defaults);
    } catch (err) {
      console.error('Failed to load default inputs:', err);
    }
  };

  const handleInputChange = (field: keyof BuyVsRentInputs, value: number) => {
    const newInputs = { ...inputs, [field]: value };
    setInputs(newInputs);
    setError(null);
  };

  const handleSubmit = () => {
    try {
      // Validate inputs
      if (inputs.down_payment > inputs.price) {
        setError('Down payment cannot exceed property price');
        return;
      }
      if (inputs.fees_pct < 0 || inputs.fees_pct > 0.2) {
        setError('Fees percentage should be between 0% and 20%');
        return;
      }
      
      onInputsChange(inputs);
    } catch (err) {
      setError('Invalid input values');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`;
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Property Details
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Property Price"
            type="number"
            value={inputs.price}
            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: '€',
            }}
            helperText={formatCurrency(inputs.price)}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Down Payment"
            type="number"
            value={inputs.down_payment}
            onChange={(e) => handleInputChange('down_payment', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: '€',
            }}
            helperText={formatCurrency(inputs.down_payment)}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Purchase Fees"
            type="number"
            value={inputs.fees_pct * 100}
            onChange={(e) => handleInputChange('fees_pct', (parseFloat(e.target.value) || 0) / 100)}
            InputProps={{
              endAdornment: '%',
            }}
            helperText={formatPercentage(inputs.fees_pct)}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Mortgage Details
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Interest Rate"
            type="number"
            value={inputs.annual_rate * 100}
            onChange={(e) => handleInputChange('annual_rate', (parseFloat(e.target.value) || 0) / 100)}
            InputProps={{
              endAdornment: '%',
            }}
            helperText={formatPercentage(inputs.annual_rate)}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Loan Term"
            type="number"
            value={inputs.term_years}
            onChange={(e) => handleInputChange('term_years', parseInt(e.target.value) || 0)}
            InputProps={{
              endAdornment: 'years',
            }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Ownership Costs
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Property Tax (Monthly)"
            type="number"
            value={inputs.taxe_fonciere_monthly}
            onChange={(e) => handleInputChange('taxe_fonciere_monthly', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: '€',
            }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Insurance (Monthly)"
            type="number"
            value={inputs.insurance_monthly}
            onChange={(e) => handleInputChange('insurance_monthly', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: '€',
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Maintenance (Annual %)"
            type="number"
            value={inputs.maintenance_pct_annual * 100}
            onChange={(e) => handleInputChange('maintenance_pct_annual', (parseFloat(e.target.value) || 0) / 100)}
            InputProps={{
              endAdornment: '%',
            }}
            helperText={formatPercentage(inputs.maintenance_pct_annual)}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Rental Alternative
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Monthly Rent"
            type="number"
            value={inputs.monthly_rent}
            onChange={(e) => handleInputChange('monthly_rent', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: '€',
            }}
          />
        </Grid>
        
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Renter Insurance"
            type="number"
            value={inputs.renter_insurance_monthly}
            onChange={(e) => handleInputChange('renter_insurance_monthly', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: '€',
            }}
          />
        </Grid>
      </Grid>

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

export default BuyVsRentForm;

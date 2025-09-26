import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Divider,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { BuyVsRentInputs } from '../types/buyVsRent';
import { buyVsRentApi } from '../utils/api';
import { getDefaultBuyVsRentInputs, getDefaultBuyVsRentInputsSync } from '../utils/config';
import { NumericInput } from './NumericInput';

interface BuyVsRentFormProps {
  onInputsChange: (inputs: BuyVsRentInputs) => void;
  loading: boolean;
}

const BuyVsRentForm: React.FC<BuyVsRentFormProps> = ({ onInputsChange, loading }: BuyVsRentFormProps) => {
  const [inputs, setInputs] = useState<BuyVsRentInputs>(getDefaultBuyVsRentInputsSync());

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load default values from shared config via backend API
    const loadDefaults = async () => {
      try {
        const defaults = await getDefaultBuyVsRentInputs();
        setInputs(defaults);
        onInputsChange(defaults);
      } catch (error) {
        console.error('Failed to load defaults:', error);
        // Fallback to sync version if async fails
        const fallbackDefaults = getDefaultBuyVsRentInputsSync();
        setInputs(fallbackDefaults);
        onInputsChange(fallbackDefaults);
      }
    };
    
    loadDefaults();
  }, []);

  const handleInputChange = (field: keyof BuyVsRentInputs, value: number | string | boolean) => {
    const newInputs = { ...inputs, [field]: value };
    setInputs(newInputs);
    setError(null);
    // Trigger analysis update with debounce
    onInputsChange(newInputs);
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('price', parseFloat(e.target.value) || 0)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('down_payment', parseFloat(e.target.value) || 0)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('fees_pct', (parseFloat(e.target.value) || 0) / 100)}
            InputProps={{
              endAdornment: '%',
            }}
            helperText={`${(inputs.fees_pct * 100).toFixed(2)}%`}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('annual_rate', (parseFloat(e.target.value) || 0) / 100)}
            InputProps={{
              endAdornment: '%',
            }}
            helperText={`${(inputs.annual_rate * 100).toFixed(2)}%`}
          />
        </Grid>
        
        <Grid item xs={6}>
          <NumericInput
            fullWidth
            label="Amortization Rate"
            kind="percent"
            value={inputs.amortization_rate}
            onChange={(value) => handleInputChange('amortization_rate', value)}
            dp={2}
            helperText="per year"
          />
        </Grid>
      </Grid>

      {/* Calculated Loan Term Display */}
      {inputs.amortization_rate > 0 && inputs.annual_rate > 0 && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Calculated Loan Term:
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {(() => {
              // The amortization rate represents the percentage of the loan balance that gets paid down each year
              // Formula: loan_term_years = 1 / amortization_rate
              if (inputs.amortization_rate <= 0) {
                return "Invalid rate";
              }
              
              const loanTermYears = 1 / inputs.amortization_rate;
              return `${loanTermYears.toFixed(1)} years`;
            })()}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Based on {(inputs.amortization_rate * 100).toFixed(2)}% yearly amortization rate
          </Typography>
        </Box>
      )}

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('taxe_fonciere_monthly', parseFloat(e.target.value) || 0)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('insurance_monthly', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: '€',
            }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <NumericInput
            fullWidth
            label="Maintenance (Annual %)"
            kind="percent"
            value={inputs.maintenance_pct_annual}
            onChange={(value) => handleInputChange('maintenance_pct_annual', value)}
            dp={2}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('monthly_rent', parseFloat(e.target.value) || 0)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('renter_insurance_monthly', parseFloat(e.target.value) || 0)}
            InputProps={{
              startAdornment: '€',
            }}
          />
        </Grid>
      </Grid>

          <Divider sx={{ my: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Investment & Appreciation
            </Typography>
          </Divider>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <NumericInput
                fullWidth
                label="House Appreciation Rate"
                kind="percent"
                value={inputs.house_appreciation_rate}
                onChange={(value) => handleInputChange('house_appreciation_rate', value)}
                dp={1}
                helperText="Annual house value appreciation (e.g., 2% per year)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumericInput
                fullWidth
                label="Investment Return Rate"
                kind="percent"
                value={inputs.investment_return_rate}
                onChange={(value) => handleInputChange('investment_return_rate', value)}
                dp={1}
                helperText="Annual return if down payment was invested (e.g., 7% per year)"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <NumericInput
                fullWidth
                label="Rent Inflation Rate"
                kind="percent"
                value={inputs.rent_inflation_rate}
                onChange={(value) => handleInputChange('rent_inflation_rate', value)}
                dp={1}
                helperText="Annual rent inflation rate (e.g., 2% per year)"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }}>
            <Typography variant="h6" color="text.secondary">
              Analysis Options
            </Typography>
          </Divider>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Baseline Comparison Mode</InputLabel>
                <Select
                  value={inputs.baseline_mode}
                  onChange={(e) => handleInputChange('baseline_mode', e.target.value as 'pure_renter' | 'budget_matched')}
                  label="Baseline Comparison Mode"
                >
                  <MenuItem value="pure_renter">Pure Renter (DP compounded)</MenuItem>
                  <MenuItem value="budget_matched">Budget-Matched Renter (legacy)</MenuItem>
                </Select>
                <FormHelperText>
                  Pure renter: Down payment invested independently. Budget-matched: Renter path depends on owner costs.
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={inputs.sell_on_horizon}
                    onChange={(e) => handleInputChange('sell_on_horizon', e.target.checked)}
                  />
                }
                label="Sell on Horizon"
              />
              <FormHelperText>
                Whether to sell the house at the evaluation horizon (30 years)
              </FormHelperText>
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
          onClick={async () => {
            try {
              const defaults = await getDefaultBuyVsRentInputs();
              setInputs(defaults);
              onInputsChange(defaults);
              setError(null);
            } catch (error) {
              console.error('Failed to reset to defaults:', error);
              const fallbackDefaults = getDefaultBuyVsRentInputsSync();
              setInputs(fallbackDefaults);
              onInputsChange(fallbackDefaults);
              setError(null);
            }
          }}
          disabled={loading}
        >
          Reset
        </Button>
      </Box>
    </Box>
  );
};

export default BuyVsRentForm;

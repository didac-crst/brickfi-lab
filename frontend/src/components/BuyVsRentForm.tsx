import React, { useState, useEffect } from 'react';
import {
  Box,
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
  SelectChangeEvent,
} from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { BuyVsRentInputs } from '../types/buyVsRent';
import { buyVsRentApi } from '../utils/api';
import { getDefaultBuyVsRentInputs, getDefaultBuyVsRentInputsSync } from '../utils/config';
import { NumericInput, PercentInput } from './NumericInput';
import { getFieldStepSync } from '../utils/inputConfig';

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
          <NumericInput
            fullWidth
            label="Property Price"
            kind="currency"
            value={inputs.price}
            onChange={(value) => handleInputChange('price', value)}
            step={getFieldStepSync('property_price')}
          />
        </Grid>
        
        <Grid item xs={6}>
          <NumericInput
            fullWidth
            label="Down Payment"
            kind="currency"
            value={inputs.down_payment}
            onChange={(value) => handleInputChange('down_payment', value)}
            step={getFieldStepSync('down_payment')}
          />
        </Grid>
        
        <Grid item xs={6}>
          <PercentInput
            fullWidth
            label="Purchase Fees"
            value={inputs.fees_pct}
            onChange={(value) => handleInputChange('fees_pct', value)}
            dp={2}
            step={getFieldStepSync('fees_pct')}
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Mortgage Details
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <PercentInput
            fullWidth
            label="Interest Rate"
            value={inputs.annual_rate}
            onChange={(value) => handleInputChange('annual_rate', value)}
            dp={2}
            step={getFieldStepSync('annual_rate')}
            helperText="per year"
          />
        </Grid>
        
        <Grid item xs={6}>
          <PercentInput
            fullWidth
            label="Amortization Rate"
            value={inputs.amortization_rate}
            onChange={(value) => handleInputChange('amortization_rate', value)}
            dp={2}
            step={getFieldStepSync('amortization_rate')}
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
          <NumericInput
            fullWidth
            label="Property Tax"
            kind="currency"
            value={inputs.taxe_fonciere_monthly}
            onChange={(value) => handleInputChange('taxe_fonciere_monthly', value)}
            step={getFieldStepSync('taxe_fonciere_monthly')}
            helperText="per month"
          />
        </Grid>
        
        <Grid item xs={6}>
          <NumericInput
            fullWidth
            label="Insurance"
            kind="currency"
            value={inputs.insurance_monthly}
            onChange={(value) => handleInputChange('insurance_monthly', value)}
            step={getFieldStepSync('insurance_monthly')}
            helperText="per month"
          />
        </Grid>
        
        <Grid item xs={12}>
          <PercentInput
            fullWidth
            label="Maintenance"
            value={inputs.maintenance_pct_annual}
            onChange={(value) => handleInputChange('maintenance_pct_annual', value)}
            dp={2}
            step={getFieldStepSync('maintenance_pct_annual')}
            helperText="per year"
          />
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Rental Alternative
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <NumericInput
            fullWidth
            label="Rent"
            kind="currency"
            value={inputs.monthly_rent}
            onChange={(value) => handleInputChange('monthly_rent', value)}
            step={getFieldStepSync('monthly_rent')}
            helperText="per month"
          />
        </Grid>
        
        <Grid item xs={6}>
          <NumericInput
            fullWidth
            label="Renter Insurance"
            kind="currency"
            value={inputs.renter_insurance_monthly}
            onChange={(value) => handleInputChange('renter_insurance_monthly', value)}
            step={getFieldStepSync('renter_insurance_monthly')}
            helperText="per month"
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
              <PercentInput
                fullWidth
                label="House Appreciation Rate"
                value={inputs.house_appreciation_rate}
                onChange={(value) => handleInputChange('house_appreciation_rate', value)}
                dp={2}
                step={getFieldStepSync('house_appreciation_rate')}
                helperText="per year"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PercentInput
                fullWidth
                label="Investment Return Rate"
                value={inputs.investment_return_rate}
                onChange={(value) => handleInputChange('investment_return_rate', value)}
                dp={2}
                step={getFieldStepSync('investment_return_rate')}
                helperText="Annual return if down payment was invested"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <PercentInput
                fullWidth
                label="Rent Inflation Rate"
                value={inputs.rent_inflation_rate}
                onChange={(value) => handleInputChange('rent_inflation_rate', value)}
                dp={2}
                step={getFieldStepSync('rent_inflation_rate')}
                helperText="per year"
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
                  onChange={(e: SelectChangeEvent<'pure_renter' | 'budget_matched'>) => handleInputChange('baseline_mode', e.target.value as 'pure_renter' | 'budget_matched')}
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
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('sell_on_horizon', e.target.checked)}
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

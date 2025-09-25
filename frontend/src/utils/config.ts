import { BuyVsRentInputs } from '../types/buyVsRent';
import { buyVsRentApi } from './api';

// Cache for default values to avoid repeated API calls
let cachedDefaults: BuyVsRentInputs | null = null;

export const getDefaultBuyVsRentInputs = async (): Promise<BuyVsRentInputs> => {
  // Return cached values if available
  if (cachedDefaults) {
    return cachedDefaults;
  }

  try {
    // Fetch from backend API (which reads from shared config)
    const defaults = await buyVsRentApi.getDefaultInputs();
    cachedDefaults = defaults;
    return defaults;
  } catch (error) {
    console.error('Failed to fetch default inputs from backend, using fallback:', error);
    
    // Fallback values if API fails
    const fallbackDefaults: BuyVsRentInputs = {
      price: 500000,
      fees_pct: 0.10,
      down_payment: 100000,
      annual_rate: 0.03,
      amortization_rate: 0.05,
      monthly_rent: 2000,
      taxe_fonciere_monthly: 0,
      insurance_monthly: 0,
      maintenance_pct_annual: 0.0,
      renter_insurance_monthly: 0
    };
    
    return fallbackDefaults;
  }
};

// Synchronous version for immediate use (returns cached or fallback)
export const getDefaultBuyVsRentInputsSync = (): BuyVsRentInputs => {
  if (cachedDefaults) {
    return cachedDefaults;
  }
  
  // Return fallback if no cache available
  return {
    price: 500000,
    fees_pct: 0.10,
    down_payment: 100000,
    annual_rate: 0.03,
    amortization_rate: 0.05,
    monthly_rent: 2000,
    taxe_fonciere_monthly: 0,
    insurance_monthly: 0,
    maintenance_pct_annual: 0.0,
    renter_insurance_monthly: 0
  };
};

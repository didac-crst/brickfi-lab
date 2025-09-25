import { BuyVsRentInputs } from '../types/buyVsRent';
import { buyVsRentApi } from './api';

// Try to import the copied config, fallback to shared config in Docker
let defaultConfig: any;
try {
  defaultConfig = require('../config/defaults.json');
} catch (error) {
  // In Docker environment, try to read from shared config
  try {
    defaultConfig = require('/shared/config/defaults.json');
  } catch (sharedError) {
    // Ultimate fallback - hardcoded values (should never happen)
    console.warn('Could not load config from any source, using hardcoded fallback');
    defaultConfig = {
      buy_vs_rent: {
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
      }
    };
  }
}

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
    console.error('Failed to fetch default inputs from backend, using fallback from copied config:', error);
    
    // Fallback values from copied shared config
    return defaultConfig.buy_vs_rent as BuyVsRentInputs;
  }
};

// Synchronous version for immediate use (returns cached or fallback)
export const getDefaultBuyVsRentInputsSync = (): BuyVsRentInputs => {
  if (cachedDefaults) {
    return cachedDefaults;
  }
  
  // Return fallback from copied shared config if no cache available
  return defaultConfig.buy_vs_rent as BuyVsRentInputs;
};

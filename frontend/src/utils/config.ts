import { BuyVsRentInputs } from '../types/buyVsRent';
import { buyVsRentApi } from './api';
import defaultConfig from '../config/defaults.json';

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

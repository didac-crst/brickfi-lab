import { BuyVsRentInputs } from '../types/buyVsRent';

// Default values - these should match the shared config file
// In a real app, you might fetch this from the backend or a config service
const DEFAULT_CONFIG = {
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

export const getDefaultBuyVsRentInputs = (): BuyVsRentInputs => {
  return DEFAULT_CONFIG.buy_vs_rent as BuyVsRentInputs;
};

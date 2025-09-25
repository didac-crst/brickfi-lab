export interface BuyVsRentInputs {
  price: number;
  fees_pct: number;
  down_payment: number;
  annual_rate: number;
  amortization_rate: number; // Monthly amortization rate (e.g., 0.004 for 0.4% per month)
  monthly_rent: number;
  taxe_fonciere_monthly: number;
  insurance_monthly: number;
  maintenance_pct_annual: number;
  renter_insurance_monthly: number;
}

export interface BuyVsRentSummary {
  property_price: number;
  total_acquisition_cost: number;
  mortgage_amount: number;
  monthly_PI: number;
  owner_cost_month1: number;
  annual_saving_vs_rent: number;
  break_even_years: number | null;
  monthly_rent_total: number;
  owner_vs_rent_monthly: number;
  calculated_loan_term_years: number;
  monthly_amortization_rate: number;
}

export interface SensitivityResult {
  rate: number;
  rent: number;
  owner_cost_m1: number;
  annual_saving: number;
  break_even_years: number | null;
}

export interface SensitivityInputs {
  base_inputs: BuyVsRentInputs;
  rates: number[];
  rents: number[];
  sell_cost_pct: number;
}

export interface CashFlowData {
  month: number;
  total_payment: number;
  interest_payment: number;
  principal_payment: number;
  owner_cost: number;
  rent_cost: number;
  savings_vs_rent: number;
  cumulative_savings: number;
}

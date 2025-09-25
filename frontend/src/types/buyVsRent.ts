export interface BuyVsRentInputs {
  price: number;
  fees_pct: number;
  down_payment: number;
  annual_rate: number;
  amortization_rate: number; // Yearly amortization rate (e.g., 0.05 for 5% per year)
  monthly_rent: number;
  taxe_fonciere_monthly: number;
  insurance_monthly: number;
  maintenance_pct_annual: number;
  renter_insurance_monthly: number;
  house_appreciation_rate: number; // Annual house appreciation rate (e.g., 0.02 for 2% per year)
  investment_return_rate: number; // Annual investment return rate for down payment (e.g., 0.07 for 7% per year)
  baseline_mode: 'pure_renter' | 'budget_matched'; // Baseline comparison mode
  sell_on_horizon: boolean; // Whether to sell the house at the evaluation horizon
}

export interface PureBaselinePoint {
  year: number;
  baseline_liquid: number;
  cumul_rent: number;
  house_value: number;
  remaining_mortgage: number;
  equity: number;
  net_equity: number;
  cumul_interest: number;
  cumul_owner_other: number;
  cumul_owner_cost: number;
  cashflow_gap: number;
  net_advantage: number;
  components: {
    appreciation_gain: number;
    principal_built: number;
    interest_drag: number;        // negative
    opportunity_cost_dp: number;  // negative
    rent_avoided_net: number;
    closing_costs: number;        // negative
  };
}

export interface BuyVsRentSummary {
  property_price: number;
  total_acquisition_cost: number;
  mortgage_amount: number;
  monthly_PI: number;
  total_interest_paid: number;
  owner_cost_month1: number;
  annual_saving_vs_rent: number;
  break_even_years: number | null;
  monthly_rent_total: number;
  owner_vs_rent_monthly: number;
  calculated_loan_term_years: number;
  yearly_amortization_rate: number;
  // Wealth comparison metrics
  house_wealth_10_years: number;
  investment_wealth_10_years: number;
  house_wealth_20_years: number;
  investment_wealth_20_years: number;
  house_wealth_30_years: number;
  investment_wealth_30_years: number;
  wealth_crossover_year: number | null;
  // Pure renter baseline metrics
  baseline_liquid_30_years: number;
  net_advantage_30_years: number;
  cashflow_gap_30_years: number;
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

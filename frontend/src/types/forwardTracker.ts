export interface ForwardPremiumSchedule {
  free_months: number;
  premium_pp_per_month: number;
}

export interface ForwardDecisionRules {
  lock_10y_le: number;
  lock_10y_alt: number;
  min_5y_discount_bp: number;
  small_loan_threshold: number;
  small_loan_surcharge_bp: number;
}

export interface ForwardDecisionInputs {
  spot_10y: number;
  spot_5y?: number;
  lead_months: number;
  loan_amount: number;
  rules: ForwardDecisionRules;
  schedule: ForwardPremiumSchedule;
}

export interface ForwardDecisionResult {
  decision: string;
  reason: string;
  forward_10y_rate: number;
  diagnostics: Record<string, number>;
}

export interface PremiumScheduleAnalysis {
  months: number[];
  premiums: number[];
  forward_rates: number[];
  decisions: string[];
}

export interface MarketObservation {
  date: string;
  eur_swap_5y?: number;
  eur_swap_10y?: number;
  quote_5y_all_in?: number;
  quote_10y_all_in?: number;
}

export interface SmallLoanTrickResult {
  interest_year1_small_rate_pct: number;
  interest_year1_big_rate_pct: number;
  approx_first_year_saving_eur: number;
  note: string;
}

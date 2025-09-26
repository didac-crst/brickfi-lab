/**
 * Input parameters for buy vs rent analysis.
 * 
 * This interface defines all the user-provided parameters needed to perform
 * a comprehensive buy vs rent analysis, including property details,
 * financial parameters, and analysis options.
 * 
 * @interface BuyVsRentInputs
 */
export interface BuyVsRentInputs {
  /** Purchase price of the property in euros */
  price: number;
  /** Upfront purchase costs as percentage of property price (0-20%) */
  fees_pct: number;
  /** Cash payment toward the purchase price in euros */
  down_payment: number;
  /** Fixed mortgage nominal annual interest rate (0-20%) */
  annual_rate: number;
  /** Yearly amortization rate (e.g., 0.05 for 5% per year) */
  amortization_rate: number;
  /** Comparable market rental price per month in euros */
  monthly_rent: number;
  /** Monthly property tax equivalent in euros */
  taxe_fonciere_monthly: number;
  /** Borrower/homeowner insurance monthly cost in euros */
  insurance_monthly: number;
  /** Annual maintenance costs as percentage of property price */
  maintenance_pct_annual: number;
  /** Optional renter insurance monthly cost in euros */
  renter_insurance_monthly: number;
  /** Annual house value appreciation rate (e.g., 0.02 for 2% per year) */
  house_appreciation_rate: number;
  /** Annual investment return rate for down payment (e.g., 0.07 for 7% per year) */
  investment_return_rate: number;
  /** Baseline comparison mode - 'pure_renter' or 'budget_matched' */
  baseline_mode: 'pure_renter' | 'budget_matched';
  /** Whether to sell the house at the evaluation horizon */
  sell_on_horizon: boolean;
}

/**
 * Data point for pure renter baseline vs buy comparison analysis.
 * 
 * This interface represents a single yearly data point in the pure renter baseline
 * analysis, which compares the financial outcomes of buying a property versus
 * investing the down payment and renting. The baseline is rate-independent
 * by construction.
 * 
 * @interface PureBaselinePoint
 */
export interface PureBaselinePoint {
  /** Year in the analysis timeline (0-30) */
  year: number;
  /** Pure renter wealth (down payment compounded at investment rate) */
  baseline_liquid: number;
  /** Cumulative rent paid up to this year */
  cumul_rent: number;
  /** Current house value (appreciated from purchase price) */
  house_value: number;
  /** Remaining mortgage balance */
  remaining_mortgage: number;
  /** Owner equity (house value - remaining mortgage) */
  equity: number;
  /** Net equity (same as equity unless selling on horizon) */
  net_equity: number;
  /** Cumulative interest paid on mortgage */
  cumul_interest: number;
  /** Cumulative other owner costs (taxes, insurance, maintenance, fees) */
  cumul_owner_other: number;
  /** Cumulative total owner costs */
  cumul_owner_cost: number;
  /** Cumulative cashflow gap (rent - owner costs) */
  cashflow_gap: number;
  /** Net advantage of buying vs pure renter baseline */
  net_advantage: number;
  /** Component breakdown for waterfall analysis */
  components: {
    /** House value growth over time */
    appreciation_gain: number;
    /** Equity accumulated through mortgage payments */
    principal_built: number;
    /** Total interest paid (negative) */
    interest_drag: number;
    /** Foregone investment returns on down payment (negative) */
    opportunity_cost_dp: number;
    /** Net benefit from not paying rent */
    rent_avoided_net: number;
    /** Upfront purchase costs (negative) */
    closing_costs: number;
  };
}

/**
 * Summary results from buy vs rent analysis.
 * 
 * This interface contains the key financial metrics and analysis results
 * from a comprehensive buy vs rent comparison, including mortgage details,
 * cost comparisons, wealth projections, and decision metrics.
 * 
 * @interface BuyVsRentSummary
 */
export interface BuyVsRentSummary {
  /** Original purchase price of the property */
  property_price: number;
  /** Total cost including purchase price and fees */
  total_acquisition_cost: number;
  /** Loan amount after down payment */
  mortgage_amount: number;
  /** Monthly principal and interest payment */
  monthly_PI: number;
  /** Total interest paid over the loan term */
  total_interest_paid: number;
  /** Monthly ownership cost excluding principal in first month */
  owner_cost_month1: number;
  /** Annual savings compared to renting (negative = renting cheaper) */
  annual_saving_vs_rent: number;
  /** Years until ownership becomes advantageous */
  break_even_years: number | null;
  /** Total monthly rental cost including insurance */
  monthly_rent_total: number;
  /** Monthly cost difference (positive = ownership costs more) */
  owner_vs_rent_monthly: number;
  /** Loan term calculated from amortization rate */
  calculated_loan_term_years: number;
  /** Yearly amortization rate used in calculations */
  yearly_amortization_rate: number;
  
  // Wealth comparison metrics
  /** House wealth after 10 years (value - remaining mortgage) */
  house_wealth_10_years: number;
  /** Investment wealth after 10 years (rent+invest strategy) */
  investment_wealth_10_years: number;
  /** House wealth after 20 years */
  house_wealth_20_years: number;
  /** Investment wealth after 20 years */
  investment_wealth_20_years: number;
  /** House wealth after 30 years */
  house_wealth_30_years: number;
  /** Investment wealth after 30 years */
  investment_wealth_30_years: number;
  /** Year when investment strategy overtakes house wealth */
  wealth_crossover_year: number | null;
  
  // Pure renter baseline metrics
  /** Pure renter baseline wealth after 30 years */
  baseline_liquid_30_years: number;
  /** Net advantage of buying vs pure renter baseline after 30 years */
  net_advantage_30_years: number;
  /** Cumulative cashflow gap after 30 years */
  cashflow_gap_30_years: number;
}

/**
 * Result from a single sensitivity analysis scenario.
 * 
 * This interface contains the analysis results for one specific combination
 * of interest rate and rental price in a sensitivity analysis.
 * 
 * @interface SensitivityResult
 */
export interface SensitivityResult {
  /** Interest rate tested in this scenario */
  rate: number;
  /** Rental price tested in this scenario */
  rent: number;
  /** Monthly ownership cost in first month */
  owner_cost_m1: number;
  /** Annual savings vs renting (negative = renting cheaper) */
  annual_saving: number;
  /** Years until ownership becomes advantageous */
  break_even_years: number | null;
}

/**
 * Input parameters for sensitivity analysis.
 * 
 * This interface defines the parameters needed to perform sensitivity analysis
 * across different interest rates and rental prices to test the robustness
 * of the buy vs rent decision under various market conditions.
 * 
 * @interface SensitivityInputs
 */
export interface SensitivityInputs {
  /** Base scenario input parameters */
  base_inputs: BuyVsRentInputs;
  /** List of interest rates to test in the analysis */
  rates: number[];
  /** List of rental prices to test in the analysis */
  rents: number[];
  /** Selling costs as percentage of property price */
  sell_cost_pct: number;
}

/**
 * Monthly cash flow breakdown data.
 * 
 * This interface represents the detailed monthly cash flow breakdown
 * for mortgage payments and cost comparisons.
 * 
 * @interface CashFlowData
 */
export interface CashFlowData {
  /** Month number in the analysis (1-360 for 30 years) */
  month: number;
  /** Total monthly mortgage payment (principal + interest) */
  total_payment: number;
  /** Interest portion of the monthly payment */
  interest_payment: number;
  /** Principal portion of the monthly payment */
  principal_payment: number;
  /** Total monthly ownership cost (excluding principal) */
  owner_cost: number;
  /** Total monthly rental cost */
  rent_cost: number;
  /** Monthly savings vs renting (negative = renting cheaper) */
  savings_vs_rent: number;
  /** Cumulative savings vs renting up to this month */
  cumulative_savings: number;
}

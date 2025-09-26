"""
Buy vs Rent Analysis Data Models

This module defines Pydantic models for the buy vs rent analysis system.
It includes input validation, data structures for analysis results,
and comprehensive type definitions for the financial calculations.

Models:
    BuyVsRentInputs: User input parameters for property analysis
    BuyVsRentSummary: Key financial metrics and analysis results
    SensitivityResult: Results from sensitivity analysis scenarios
    PureBaselinePoint: Data point for pure renter baseline comparison
    CashFlowData: Monthly cash flow breakdown
    SensitivityInputs: Parameters for sensitivity analysis
"""

from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class BuyVsRentInputs(BaseModel):
    """
    Input parameters for buy vs rent analysis.
    
    This model contains all the user-provided parameters needed to perform
    a comprehensive buy vs rent analysis, including property details,
    financial parameters, and analysis options.
    
    Attributes:
        price (float): Purchase price of the property in euros
        fees_pct (float): Upfront purchase costs as percentage of price (0-20%)
        down_payment (float): Cash payment toward the purchase price in euros
        annual_rate (float): Fixed mortgage nominal annual interest rate (0-20%)
        amortization_rate (float): Yearly amortization rate (0-10%)
        monthly_rent (float): Comparable market rental price per month in euros
        taxe_fonciere_monthly (float): Monthly property tax equivalent in euros
        insurance_monthly (float): Borrower/homeowner insurance monthly cost in euros
        maintenance_pct_annual (float): Annual maintenance costs as percentage of property price
        renter_insurance_monthly (float): Optional renter insurance monthly cost in euros
        house_appreciation_rate (float): Annual house value appreciation rate (0-20%)
        investment_return_rate (float): Annual investment return rate for down payment (0-30%)
        rent_inflation_rate (float): Annual rent inflation rate (0-10%)
        baseline_mode (str): Comparison mode - 'pure_renter' or 'budget_matched'
        sell_on_horizon (bool): Whether to sell the house at the evaluation horizon
    
    Example:
        >>> inputs = BuyVsRentInputs(
        ...     price=500000,
        ...     fees_pct=0.10,
        ...     down_payment=100000,
        ...     annual_rate=0.03,
        ...     amortization_rate=0.05,
        ...     monthly_rent=2000,
        ...     house_appreciation_rate=0.02,
        ...     investment_return_rate=0.07
        ... )
    """
    price: float = Field(..., description="Purchase price of the home (euros)", gt=0)
    fees_pct: float = Field(..., description="Upfront purchase costs as fraction of price", ge=0, lt=0.2)
    down_payment: float = Field(..., description="Cash used toward the price (euros)", ge=0)
    annual_rate: float = Field(..., description="Fixed mortgage nominal annual rate", gt=0, lt=0.2)
    amortization_rate: float = Field(..., description="Yearly amortization rate (e.g., 0.05 for 5% per year)", gt=0, lt=0.1)
    monthly_rent: float = Field(..., description="Comparable market rent (euros)", ge=0)
    taxe_fonciere_monthly: float = Field(..., description="Property tax monthly equivalent (euros)", ge=0)
    insurance_monthly: float = Field(..., description="Borrower insurance monthly cost (euros)", ge=0)
    maintenance_pct_annual: float = Field(..., description="Annual maintenance as % of price", ge=0)
    renter_insurance_monthly: float = Field(0.0, description="Optional renter insurance (euros)", ge=0)
    house_appreciation_rate: float = Field(..., description="Annual house appreciation rate (e.g., 0.02 for 2% per year)", ge=0, lt=0.2)
    investment_return_rate: float = Field(..., description="Annual investment return rate for down payment (e.g., 0.07 for 7% per year)", ge=0, lt=0.3)
    rent_inflation_rate: float = Field(0.02, description="Annual rent inflation rate (e.g., 0.02 for 2% per year)", ge=0, lt=0.1)
    baseline_mode: str = Field("pure_renter", description="Baseline comparison mode: 'pure_renter' (DP compounded) or 'budget_matched' (legacy)", pattern="^(pure_renter|budget_matched)$")
    sell_on_horizon: bool = Field(False, description="Whether to sell the house at the evaluation horizon")

    class Config:
        json_schema_extra = {
            "example": {
                "price": 500000,
                "fees_pct": 0.10,
                "down_payment": 100000,
                "annual_rate": 0.03,
                "amortization_rate": 0.05,
                "monthly_rent": 2000,
                "taxe_fonciere_monthly": 0,
                "insurance_monthly": 0,
                "maintenance_pct_annual": 0.0,
                "renter_insurance_monthly": 0,
                "house_appreciation_rate": 0.02,
                "investment_return_rate": 0.07,
                "rent_inflation_rate": 0.02
            }
        }


class BuyVsRentSummary(BaseModel):
    """
    Summary results from buy vs rent analysis.
    
    This model contains the key financial metrics and analysis results
    from a comprehensive buy vs rent comparison, including mortgage details,
    cost comparisons, wealth projections, and decision metrics.
    
    Attributes:
        property_price (float): Original purchase price of the property
        total_acquisition_cost (float): Total cost including purchase price and fees
        mortgage_amount (float): Loan amount after down payment
        monthly_PI (float): Monthly principal and interest payment
        total_interest_paid (float): Total interest paid over the loan term
        owner_cost_month1 (float): Monthly ownership cost excluding principal in first month
        annual_saving_vs_rent (float): Annual savings compared to renting (negative = renting cheaper)
        break_even_years (Optional[float]): Years until ownership becomes advantageous
        monthly_rent_total (float): Total monthly rental cost including insurance
        owner_vs_rent_monthly (float): Monthly cost difference (positive = ownership costs more)
        calculated_loan_term_years (float): Loan term calculated from amortization rate
        yearly_amortization_rate (float): Yearly amortization rate used in calculations
        house_wealth_10_years (float): House wealth after 10 years (value - remaining mortgage)
        investment_wealth_10_years (float): Investment wealth after 10 years (rent+invest strategy)
        house_wealth_20_years (float): House wealth after 20 years
        investment_wealth_20_years (float): Investment wealth after 20 years
        house_wealth_30_years (float): House wealth after 30 years
        investment_wealth_30_years (float): Investment wealth after 30 years
        wealth_crossover_year (Optional[int]): Year when investment strategy overtakes house wealth
        baseline_liquid_30_years (float): Pure renter baseline wealth after 30 years
        net_advantage_30_years (float): Net advantage of buying vs pure renter baseline after 30 years
        cashflow_gap_30_years (float): Cumulative cashflow gap after 30 years
        accounting_identity_formula (str): Mathematical formula for net advantage calculation
    """
    property_price: float
    total_acquisition_cost: float
    mortgage_amount: float
    monthly_PI: float
    total_interest_paid: float
    owner_cost_month1: float
    annual_saving_vs_rent: float
    break_even_years: Optional[float]
    monthly_rent_total: float
    owner_vs_rent_monthly: float
    calculated_loan_term_years: float
    yearly_amortization_rate: float
    # Wealth comparison metrics
    house_wealth_10_years: float
    investment_wealth_10_years: float
    house_wealth_20_years: float
    investment_wealth_20_years: float
    house_wealth_30_years: float
    investment_wealth_30_years: float
    wealth_crossover_year: Optional[int]
    # Pure renter baseline metrics
    baseline_liquid_30_years: float
    net_advantage_30_years: float
    cashflow_gap_30_years: float
    accounting_identity_formula: str

    class Config:
        json_schema_extra = {
            "example": {
                "property_price": 420000,
                "total_acquisition_cost": 451500,
                "mortgage_amount": 320000,
                "monthly_PI": 1550.97,
                "total_interest_paid": 145291.82,
                "owner_cost_month1": 1398.33,
                "annual_saving_vs_rent": 3620.00,
                "break_even_years": 14.50,
                "monthly_rent_total": 1700,
                "owner_vs_rent_monthly": 301.67,
                "calculated_loan_term_years": 20.8,
                "yearly_amortization_rate": 0.05,
                "house_wealth_10_years": 450000,
                "investment_wealth_10_years": 400000,
                "house_wealth_20_years": 550000,
                "investment_wealth_20_years": 500000,
                "house_wealth_30_years": 650000,
                "investment_wealth_30_years": 600000,
                "wealth_crossover_year": 15,
                "baseline_liquid_30_years": 761225.50,
                "net_advantage_30_years": 937298.22,
                "cashflow_gap_30_years": 792842.93,
                "accounting_identity_formula": "Net Advantage = Owner Equity - Baseline Wealth + Cashflow Gap - Closing Costs"
            }
        }


class PureBaselinePoint(BaseModel):
    """
    Data point for pure renter baseline vs buy comparison analysis.
    
    This model represents a single yearly data point in the pure renter baseline
    analysis, which compares the financial outcomes of buying a property versus
    investing the down payment and renting. The baseline is rate-independent
    by construction.
    
    Attributes:
        year (int): Year in the analysis timeline (0-30)
        baseline_liquid (float): Pure renter wealth (down payment compounded at investment rate)
        cumul_rent (float): Cumulative rent paid up to this year
        house_value (float): Current house value (appreciated from purchase price)
        remaining_mortgage (float): Remaining mortgage balance
        equity (float): Owner equity (house value - remaining mortgage)
        net_equity (float): Net equity (same as equity unless selling on horizon)
        cumul_interest (float): Cumulative interest paid on mortgage
        cumul_owner_other (float): Cumulative other owner costs (taxes, insurance, maintenance, fees)
        cumul_owner_cost (float): Cumulative total owner costs
        cashflow_gap (float): Cumulative cashflow gap (rent - owner costs)
        net_advantage (float): Net advantage of buying vs pure renter baseline
        components (Dict[str, float]): Component breakdown for waterfall analysis
            - appreciation_gain: House value growth over time
            - principal_built: Equity accumulated through mortgage payments
            - interest_drag: Total interest paid (negative)
            - opportunity_cost_dp: Foregone investment returns on down payment (negative)
            - rent_avoided_net: Net benefit from not paying rent
            - closing_costs: Upfront purchase costs (negative)
    """
    year: int
    # Baseline (renter) side
    baseline_liquid: float                 # DP compounded; rent is consumption
    cumul_rent: float
    # Buy side
    house_value: float
    remaining_mortgage: float
    equity: float                          # V_t - RB_t
    net_equity: float                      # same as equity unless sell_on_horizon & t=H
    # Cost decompositions (buy side)
    cumul_interest: float
    cumul_owner_other: float               # taxes + insurance + maintenance + upfront fees
    cumul_owner_cost: float                # interest + other + fees
    # Cross-scenario comparison
    cashflow_gap: float                    # cumul_rent - cumul_owner_cost
    net_advantage: float                   # net_equity - baseline_liquid + cashflow_gap
    # Waterfall-friendly components
    components: Dict[str, float]           # {appreciation_gain, principal_built, interest_drag, opportunity_cost_dp, rent_avoided_net, closing_costs}


class SensitivityInputs(BaseModel):
    """
    Input parameters for sensitivity analysis.
    
    This model defines the parameters needed to perform sensitivity analysis
    across different interest rates and rental prices to test the robustness
    of the buy vs rent decision under various market conditions.
    
    Attributes:
        base_inputs (BuyVsRentInputs): Base scenario input parameters
        rates (List[float]): List of interest rates to test in the analysis
        rents (List[float]): List of rental prices to test in the analysis
        sell_cost_pct (float): Selling costs as percentage of property price (0-20%)
    """
    base_inputs: BuyVsRentInputs
    rates: List[float] = Field(..., description="Interest rates to test")
    rents: List[float] = Field(..., description="Rent levels to test")
    sell_cost_pct: float = Field(0.05, description="Selling costs as % of price", ge=0, le=0.2)

    class Config:
        json_schema_extra = {
            "example": {
                "base_inputs": {
                    "price": 420000,
                    "fees_pct": 0.075,
                    "down_payment": 100000,
                    "annual_rate": 0.032,
                    "term_years": 25,
                    "monthly_rent": 1700,
                    "taxe_fonciere_monthly": 180,
                    "insurance_monthly": 50,
                    "maintenance_pct_annual": 0.009
                },
                "rates": [0.025, 0.03, 0.035, 0.04],
                "rents": [1500, 1600, 1700, 1800],
                "sell_cost_pct": 0.05
            }
        }


class SensitivityResult(BaseModel):
    """
    Result from a single sensitivity analysis scenario.
    
    This model contains the analysis results for one specific combination
    of interest rate and rental price in a sensitivity analysis.
    
    Attributes:
        rate (float): Interest rate tested in this scenario
        rent (float): Rental price tested in this scenario
        owner_cost_m1 (float): Monthly ownership cost in first month
        annual_saving (float): Annual savings vs renting (negative = renting cheaper)
        break_even_years (Optional[float]): Years until ownership becomes advantageous
    """
    rate: float
    rent: float
    owner_cost_m1: float
    annual_saving: float
    break_even_years: Optional[float]

    class Config:
        json_schema_extra = {
            "example": {
                "rate": 0.032,
                "rent": 1700,
                "owner_cost_m1": 1398.33,
                "annual_saving": 3620.00,
                "break_even_years": 14.50
            }
        }

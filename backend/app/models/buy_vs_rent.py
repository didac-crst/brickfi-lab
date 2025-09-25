from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class BuyVsRentInputs(BaseModel):
    """Container for buy-vs-rent inputs."""
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
                "investment_return_rate": 0.07
            }
        }


class BuyVsRentSummary(BaseModel):
    """Summary of buy-vs-rent analysis results."""
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
                "yearly_amortization_rate": 0.05
            }
        }


class PureBaselinePoint(BaseModel):
    """One yearly data point for the Pure Renter baseline vs Buy comparison."""
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
    """Inputs for sensitivity analysis."""
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
    """Single sensitivity analysis result."""
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

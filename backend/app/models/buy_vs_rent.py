from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, List, Dict


class BuyVsRentInputs(BaseModel):
    """Container for buy-vs-rent inputs."""
    price: float = Field(..., description="Purchase price of the home (euros)", gt=0)
    fees_pct: float = Field(..., description="Upfront purchase costs as fraction of price", ge=0, lt=0.2)
    down_payment: float = Field(..., description="Cash used toward the price (euros)", ge=0)
    annual_rate: float = Field(..., description="Fixed mortgage nominal annual rate", gt=0, lt=0.2)
    amortization_rate: float = Field(..., description="Monthly amortization rate (e.g., 0.004 for 0.4% per month)", gt=0, lt=0.1)
    monthly_rent: float = Field(..., description="Comparable market rent (euros)", ge=0)
    taxe_fonciere_monthly: float = Field(..., description="Property tax monthly equivalent (euros)", ge=0)
    insurance_monthly: float = Field(..., description="Borrower insurance monthly cost (euros)", ge=0)
    maintenance_pct_annual: float = Field(..., description="Annual maintenance as % of price", ge=0)
    renter_insurance_monthly: float = Field(0.0, description="Optional renter insurance (euros)", ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "price": 420000,
                "fees_pct": 0.075,
                "down_payment": 100000,
                "annual_rate": 0.032,
                "amortization_rate": 0.004,
                "monthly_rent": 1700,
                "taxe_fonciere_monthly": 180,
                "insurance_monthly": 50,
                "maintenance_pct_annual": 0.009,
                "renter_insurance_monthly": 0
            }
        }


class BuyVsRentSummary(BaseModel):
    """Summary of buy-vs-rent analysis results."""
    mortgage_amount: float
    monthly_PI: float
    owner_cost_month1: float
    annual_saving_vs_rent: float
    break_even_years: Optional[float]
    monthly_rent_total: float
    owner_vs_rent_monthly: float

    class Config:
        json_schema_extra = {
            "example": {
                "mortgage_amount": 320000,
                "monthly_PI": 1550.97,
                "owner_cost_month1": 1398.33,
                "annual_saving_vs_rent": 3620.00,
                "break_even_years": 14.50,
                "monthly_rent_total": 1700,
                "owner_vs_rent_monthly": 301.67
            }
        }


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

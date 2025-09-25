from __future__ import annotations

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Tuple


class ForwardPremiumSchedule(BaseModel):
    """Forward premium curve for a lender."""
    free_months: int = Field(12, description="Number of months with no premium", ge=0)
    premium_pp_per_month: float = Field(0.01, description="Premium in percentage points per month", ge=0)

    def total_premium_pp(self, lead_months: int) -> float:
        """Calculate total premium in percentage points for given lead time."""
        if lead_months <= self.free_months:
            return 0.0
        chargeable_months = lead_months - self.free_months
        return chargeable_months * self.premium_pp_per_month

    class Config:
        json_schema_extra = {
            "example": {
                "free_months": 12,
                "premium_pp_per_month": 0.01
            }
        }


class ForwardDecisionRules(BaseModel):
    """Decision triggers for refinancing."""
    lock_10y_le: float = Field(3.30, description="No-regret 10y lock threshold (%)", ge=0)
    lock_10y_alt: float = Field(3.50, description="Alternative 10y lock threshold (%)", ge=0)
    min_5y_discount_bp: int = Field(35, description="Minimum 5y advantage vs 10y (bps)", ge=0)
    small_loan_threshold: float = Field(150000, description="Small loan surcharge threshold (euros)", gt=0)
    small_loan_surcharge_bp: int = Field(10, description="Small loan surcharge (bps)", ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "lock_10y_le": 3.30,
                "lock_10y_alt": 3.50,
                "min_5y_discount_bp": 35,
                "small_loan_threshold": 150000,
                "small_loan_surcharge_bp": 10
            }
        }


class MarketObservation(BaseModel):
    """Market observation for tracking."""
    date: str = Field(..., description="Observation date (YYYY-MM-DD)")
    eur_swap_5y: Optional[float] = Field(None, description="5-year EUR swap rate (%)")
    eur_swap_10y: Optional[float] = Field(None, description="10-year EUR swap rate (%)")
    quote_5y_all_in: Optional[float] = Field(None, description="5-year all-in quote (%)")
    quote_10y_all_in: Optional[float] = Field(None, description="10-year all-in quote (%)")

    class Config:
        json_schema_extra = {
            "example": {
                "date": "2025-01-15",
                "eur_swap_5y": 3.05,
                "eur_swap_10y": 3.40,
                "quote_5y_all_in": 3.15,
                "quote_10y_all_in": 3.50
            }
        }


class ForwardDecisionInputs(BaseModel):
    """Inputs for forward rate decision analysis."""
    spot_10y: float = Field(..., description="Current best 10-year all-in rate (%)", gt=0)
    spot_5y: Optional[float] = Field(None, description="Current best 5-year all-in rate (%)", gt=0)
    lead_months: int = Field(..., description="Lead time in months", ge=0)
    loan_amount: float = Field(..., description="Loan amount (euros)", gt=0)
    rules: ForwardDecisionRules
    schedule: ForwardPremiumSchedule

    class Config:
        json_schema_extra = {
            "example": {
                "spot_10y": 3.40,
                "spot_5y": 3.05,
                "lead_months": 18,
                "loan_amount": 130000,
                "rules": {
                    "lock_10y_le": 3.30,
                    "lock_10y_alt": 3.50,
                    "min_5y_discount_bp": 35,
                    "small_loan_threshold": 150000,
                    "small_loan_surcharge_bp": 10
                },
                "schedule": {
                    "free_months": 12,
                    "premium_pp_per_month": 0.01
                }
            }
        }


class ForwardDecisionResult(BaseModel):
    """Result of forward rate decision analysis."""
    decision: str = Field(..., description="Decision: LOCK_10Y, TAKE_5Y, or WAIT")
    reason: str = Field(..., description="Explanation of the decision")
    forward_10y_rate: float = Field(..., description="Forward-loaded 10-year rate (%)")
    diagnostics: Dict[str, float] = Field(..., description="Detailed calculation diagnostics")

    class Config:
        json_schema_extra = {
            "example": {
                "decision": "LOCK_10Y",
                "reason": "Forward-loaded 10y 3.46% ≤ 3.50% (alt trigger).",
                "forward_10y_rate": 3.46,
                "diagnostics": {
                    "spot_10y": 3.40,
                    "fwd_10y": 3.46,
                    "lead_months": 18,
                    "small_loan_surcharge_bp": 10,
                    "premium_pp": 0.06,
                    "lock_10y_le": 3.30,
                    "lock_10y_alt": 3.50,
                    "min_5y_discount_bp": 35
                }
            }
        }


class PremiumScheduleAnalysis(BaseModel):
    """Analysis of premium schedule over time."""
    months: List[int] = Field(..., description="Lead time in months")
    premiums: List[float] = Field(..., description="Total premium in percentage points")
    forward_rates: List[float] = Field(..., description="Forward-loaded rates (%)")
    decisions: List[str] = Field(..., description="Decision at each lead time")

    class Config:
        json_schema_extra = {
            "example": {
                "months": [6, 12, 18, 24, 30],
                "premiums": [0.0, 0.0, 0.06, 0.12, 0.18],
                "forward_rates": [3.40, 3.40, 3.46, 3.52, 3.58],
                "decisions": ["LOCK_10Y", "LOCK_10Y", "LOCK_10Y", "WAIT", "WAIT"]
            }
        }

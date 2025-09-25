from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.models.forward_tracker import (
    ForwardDecisionInputs,
    ForwardDecisionResult,
    PremiumScheduleAnalysis,
    MarketObservation
)
from app.core.forward_tracker import ForwardRateTracker

router = APIRouter()


@router.post("/decision", response_model=ForwardDecisionResult)
async def make_forward_decision(inputs: ForwardDecisionInputs):
    """
    Make a forward rate decision based on current market conditions and rules.
    
    - **inputs**: Market rates, lead time, loan amount, and decision rules
    """
    try:
        tracker = ForwardRateTracker(inputs.rules, inputs.schedule, inputs.loan_amount)
        return tracker.decision(inputs.spot_10y, inputs.spot_5y, inputs.lead_months)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/premium-schedule", response_model=PremiumScheduleAnalysis)
async def analyze_premium_schedule(inputs: ForwardDecisionInputs, max_months: int = 36):
    """
    Analyze how forward premiums affect rates over time.
    
    - **inputs**: Market rates, loan amount, and premium schedule
    - **max_months**: Maximum lead time to analyze (default: 36 months)
    """
    try:
        tracker = ForwardRateTracker(inputs.rules, inputs.schedule, inputs.loan_amount)
        return tracker.analyze_premium_schedule(inputs.spot_10y, inputs.spot_5y, max_months)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/small-loan-trick")
async def estimate_small_loan_trick(
    offer_small_rate: float,
    offer_big_rate: float,
    base_amount: float,
    uplift_amount: float,
    years_horizon: int = 10
) -> Dict[str, Any]:
    """
    Estimate potential savings from the 'small loan then immediate prepayment' tactic.
    
    - **offer_small_rate**: Rate offered for small loan amount (%)
    - **offer_big_rate**: Rate offered for larger loan amount (%)
    - **base_amount**: Base loan amount (euros)
    - **uplift_amount**: Additional amount to prepay immediately (euros)
    - **years_horizon**: Time horizon for analysis (years)
    """
    try:
        return ForwardRateTracker.estimate_small_loan_trick_gain(
            offer_small_rate, offer_big_rate, base_amount, uplift_amount, years_horizon
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/observations")
async def add_market_observation(observation: MarketObservation):
    """Add a market observation to the tracker."""
    # In a real application, this would be stored in a database
    # For now, we'll just validate the input
    return {"message": "Observation added successfully", "observation": observation}


@router.get("/default-inputs", response_model=ForwardDecisionInputs)
async def get_default_inputs():
    """Get default input values for the forward rate analysis."""
    from app.models.forward_tracker import ForwardDecisionRules, ForwardPremiumSchedule
    
    return ForwardDecisionInputs(
        spot_10y=3.40,
        spot_5y=3.05,
        lead_months=18,
        loan_amount=130000,
        rules=ForwardDecisionRules(
            lock_10y_le=3.30,
            lock_10y_alt=3.50,
            min_5y_discount_bp=35,
            small_loan_threshold=150000,
            small_loan_surcharge_bp=10
        ),
        schedule=ForwardPremiumSchedule(
            free_months=12,
            premium_pp_per_month=0.01
        )
    )


@router.get("/rate-scenarios")
async def get_rate_scenarios():
    """Get common rate scenarios for testing different market conditions."""
    return {
        "scenarios": [
            {
                "name": "Current Market",
                "spot_10y": 3.40,
                "spot_5y": 3.05,
                "description": "Typical current market conditions"
            },
            {
                "name": "Rising Rates",
                "spot_10y": 3.80,
                "spot_5y": 3.45,
                "description": "Scenario with rising interest rates"
            },
            {
                "name": "Falling Rates",
                "spot_10y": 3.00,
                "spot_5y": 2.75,
                "description": "Scenario with falling interest rates"
            },
            {
                "name": "High Volatility",
                "spot_10y": 3.60,
                "spot_5y": 3.20,
                "description": "High volatility market conditions"
            }
        ]
    }

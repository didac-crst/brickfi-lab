from fastapi import APIRouter, HTTPException
from typing import List
from app.models.buy_vs_rent import (
    BuyVsRentInputs, 
    BuyVsRentSummary, 
    SensitivityInputs, 
    SensitivityResult,
    PureBaselinePoint
)
from app.core.buy_vs_rent import BuyVsRentAnalyzer

router = APIRouter()


@router.post("/analyze", response_model=BuyVsRentSummary)
async def analyze_buy_vs_rent(inputs: BuyVsRentInputs, sell_cost_pct: float = 0.05):
    """
    Analyze buy vs rent scenario and return summary metrics.
    
    - **inputs**: Property and financial parameters
    - **sell_cost_pct**: Selling costs as percentage of property price (default: 5%)
    """
    try:
        analyzer = BuyVsRentAnalyzer(inputs)
        return analyzer.summary(sell_cost_pct)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/sensitivity", response_model=List[SensitivityResult])
async def sensitivity_analysis(inputs: SensitivityInputs):
    """
    Perform sensitivity analysis across different interest rates and rent levels.
    
    - **inputs**: Base scenario plus ranges of rates and rents to test
    """
    try:
        analyzer = BuyVsRentAnalyzer(inputs.base_inputs)
        return analyzer.sensitivity(inputs.rates, inputs.rents, inputs.sell_cost_pct)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/cash-flow")
async def monthly_cash_flow_analysis(inputs: BuyVsRentInputs, months: int = 60):
    """
    Generate monthly cash flow analysis for the first N months.
    
    - **inputs**: Property and financial parameters
    - **months**: Number of months to analyze (default: 60)
    """
    try:
        analyzer = BuyVsRentAnalyzer(inputs)
        return analyzer.monthly_cash_flow_analysis(months)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/default-inputs", response_model=BuyVsRentInputs)
async def get_default_inputs():
    """Get default input values for the buy vs rent analysis."""
    import json
    import os
    
    # Load defaults from shared config file
    config_path = "/shared/config/defaults.json"
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    defaults = config["buy_vs_rent"]
    return BuyVsRentInputs(**defaults)


@router.post("/house-value-over-time")
async def get_house_value_over_time(inputs: BuyVsRentInputs, years: int = 30):
    """
    Calculate house value over time with appreciation.
    
    Args:
        inputs: Buy vs rent analysis inputs
        years: Number of years to project (default: 30)
    
    Returns:
        List of yearly house values with appreciation
    """
    try:
        analyzer = BuyVsRentAnalyzer(inputs)
        return analyzer.house_value_over_time(years)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/investment-value-over-time")
async def get_investment_value_over_time(inputs: BuyVsRentInputs, years: int = 30):
    """
    Calculate investment value over time if down payment was invested instead.
    
    Args:
        inputs: Buy vs rent analysis inputs
        years: Number of years to project (default: 30)
    
    Returns:
        List of yearly investment values with gains
    """
    try:
        analyzer = BuyVsRentAnalyzer(inputs)
        return analyzer.investment_value_over_time(years)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/wealth-comparison-over-time")
async def get_wealth_comparison_over_time(inputs: BuyVsRentInputs, years: int = 30):
    """
    Compare total wealth between buying vs renting+investing over time.
    
    Args:
        inputs: Buy vs rent analysis inputs
        years: Number of years to project (default: 30)
    
    Returns:
        List of yearly wealth comparisons between buying and renting+investing
    """
    try:
        analyzer = BuyVsRentAnalyzer(inputs)
        return analyzer.wealth_comparison_over_time(years)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/pure-renter-baseline-over-time")
async def get_pure_renter_baseline_over_time(inputs: BuyVsRentInputs, years: int = 30):
    """
    Calculate pure renter baseline: down payment compounded at investment rate (rate-independent).
    
    Args:
        inputs: Buy vs rent analysis inputs
        years: Number of years to project (default: 30)
    
    Returns:
        List of yearly pure renter baseline values
    """
    try:
        analyzer = BuyVsRentAnalyzer(inputs)
        return analyzer.pure_renter_baseline_over_time(years)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/net-advantage-over-time")
async def get_net_advantage_over_time(inputs: BuyVsRentInputs, years: int = 30):
    """
    Calculate net advantage of buying vs pure renter baseline with component breakdown.
    
    Args:
        inputs: Buy vs rent analysis inputs
        years: Number of years to project (default: 30)
    
    Returns:
        List of yearly net advantage calculations with component breakdown
    """
    try:
        analyzer = BuyVsRentAnalyzer(inputs)
        return analyzer.net_advantage_over_time(years)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/pure-baseline-wealth", response_model=List[PureBaselinePoint])
async def pure_baseline_wealth(
    inputs: BuyVsRentInputs,
    years: int = 30,
    sell_on_horizon: bool = False,
    sell_cost_pct: float = 0.05,
):
    """
    Pure Renter baseline (DP compounded; rent consumed) vs Buy — yearly series.
    Baseline is independent of mortgage rates.
    """
    try:
        analyzer = BuyVsRentAnalyzer(inputs)
        return analyzer.pure_baseline_vs_buy_over_time(
            years=years,
            sell_on_horizon=sell_on_horizon,
            sell_cost_pct=sell_cost_pct,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

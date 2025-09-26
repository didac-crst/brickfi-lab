"""
Buy vs Rent Analysis API Endpoints

This module provides REST API endpoints for comprehensive buy vs rent analysis.
It exposes various analysis capabilities including core analysis, sensitivity analysis,
wealth comparison, and pure renter baseline analysis.

API Endpoints:
    POST /analyze - Core buy vs rent analysis with summary metrics
    POST /sensitivity - Sensitivity analysis across different market conditions
    POST /cash-flow - Monthly cash flow breakdown
    POST /house-value-over-time - House value appreciation over time
    POST /investment-value-over-time - Investment value growth over time
    POST /wealth-comparison-over-time - Wealth comparison between buying and renting
    POST /pure-renter-baseline-over-time - Pure renter baseline analysis
    POST /net-advantage-over-time - Net advantage evolution over time
    POST /pure-baseline-wealth - Comprehensive pure baseline vs buy comparison
    GET /default-inputs - Get default input parameters

All endpoints return structured JSON responses with detailed financial metrics
and analysis results suitable for frontend visualization and decision support.

Author: BrickFi-Lab
"""

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
    Perform comprehensive buy vs rent analysis and return summary metrics.
    
    This is the core analysis endpoint that performs a complete financial comparison
    between buying and renting a property. It calculates key metrics including
    mortgage details, cost comparisons, break-even analysis, and wealth projections.
    
    Args:
        inputs (BuyVsRentInputs): Complete set of property and financial parameters
        sell_cost_pct (float, optional): Selling costs as percentage of property price. Defaults to 0.05 (5%).
    
    Returns:
        BuyVsRentSummary: Comprehensive analysis results including:
            - Mortgage details (amount, monthly payment, total interest)
            - Cost comparisons (owner vs rent costs)
            - Financial metrics (annual savings, break-even years)
            - Wealth projections (10, 20, 30 year comparisons)
            - Pure baseline metrics (rate-independent analysis)
    
    Raises:
        HTTPException: 400 if input validation fails or analysis cannot be performed
    
    Example:
        ```json
        {
            "price": 500000,
            "down_payment": 100000,
            "annual_rate": 0.03,
            "amortization_rate": 0.05,
            "monthly_rent": 2000,
            "house_appreciation_rate": 0.02,
            "investment_return_rate": 0.07
        }
        ```
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

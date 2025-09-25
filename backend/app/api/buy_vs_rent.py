from fastapi import APIRouter, HTTPException
from typing import List
from app.models.buy_vs_rent import (
    BuyVsRentInputs, 
    BuyVsRentSummary, 
    SensitivityInputs, 
    SensitivityResult
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
    
    # Load defaults from config file
    config_path = os.path.join(os.path.dirname(__file__), "../../config/defaults.json")
    with open(config_path, 'r') as f:
        config = json.load(f)
    
    defaults = config["buy_vs_rent"]
    return BuyVsRentInputs(**defaults)

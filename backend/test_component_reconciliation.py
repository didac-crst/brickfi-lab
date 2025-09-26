#!/usr/bin/env python3
"""
Unit tests for component reconciliation in buy vs rent analysis.

This test suite verifies that waterfall components sum exactly to net advantage
at all time horizons, ensuring mathematical consistency and audit-grade accuracy.
"""

import pytest
from app.models.buy_vs_rent import BuyVsRentInputs
from app.core.buy_vs_rent import BuyVsRentAnalyzer

# Default inputs for testing
DEFAULT_INPUTS = BuyVsRentInputs(
    price=500000,
    fees_pct=0.10,
    down_payment=100000,
    annual_rate=0.03,
    amortization_rate=0.05,
    monthly_rent=2000,
    taxe_fonciere_monthly=0,
    insurance_monthly=0,
    maintenance_pct_annual=0.0,
    renter_insurance_monthly=0,
    house_appreciation_rate=0.02,
    investment_return_rate=0.07,
    rent_inflation_rate=0.02,
    baseline_mode="pure_renter",
    sell_on_horizon=False
)

@pytest.fixture
def analyzer():
    """Create analyzer instance for testing."""
    return BuyVsRentAnalyzer(DEFAULT_INPUTS)

def test_component_reconciliation_at_multiple_horizons(analyzer):
    """
    Test that components sum exactly to net advantage at multiple time horizons.
    
    This test verifies the core accounting identity:
    net_advantage = Σ(components) at all years
    """
    years_to_test = [0, 5, 10, 15, 20, 25, 30]
    pure_baseline_data = analyzer.pure_baseline_vs_buy_over_time(years=30)
    
    errors = []
    failed_years = []
    
    for year in years_to_test:
        if year > 30:
            continue
            
        data_point = pure_baseline_data[year]
        net_advantage = data_point.net_advantage
        components = data_point.components
        
        # Calculate component sum
        component_sum = (
            components["appreciation_gain"] +
            components["principal_built"] +
            components["down_payment"] +
            components["opportunity_cost_dp"] +
            components["rent_avoided_net"] +
            components["closing_costs"]
        )
        
        # Check reconciliation
        error = abs(net_advantage - component_sum)
        if error > 1e-6:  # Allow for small floating point inaccuracies
            errors.append(error)
            failed_years.append(year)
    
    print("\nTesting component reconciliation at multiple horizons...")
    print(f"Years tested: {years_to_test}")
    print(f"Maximum error: {max(errors) if errors else 0:.10f}")
    print(f"Failed years: {len(failed_years)}")
    if failed_years:
        print(f"Years with errors: {failed_years}")
        for year in failed_years:
            dp = pure_baseline_data[year]
            print(f"  Year {year}: net_adv={dp.net_advantage:.2f}, components={sum(dp.components.values()):.2f}, error={abs(dp.net_advantage - sum(dp.components.values())):.2f}")
    
    assert not errors, f"Component reconciliation failed for years: {failed_years} with max error {max(errors):.10f}"
    print("✅ Component reconciliation holds at all tested horizons")

def test_net_advantage_accounting_identity(analyzer):
    """
    Test the core accounting identity: net_advantage = net_equity - baseline_liquid + cashflow_gap.
    
    This verifies that the net advantage calculation is mathematically sound.
    """
    years_to_test = [0, 5, 10, 15, 20, 25, 30]
    pure_baseline_data = analyzer.pure_baseline_vs_buy_over_time(years=30)
    
    errors = []
    failed_years = []
    
    for year in years_to_test:
        if year > 30:
            continue
            
        data_point = pure_baseline_data[year]
        net_advantage = data_point.net_advantage
        net_equity = data_point.net_equity
        baseline_liquid = data_point.baseline_liquid
        cashflow_gap = data_point.cashflow_gap
        
        # Calculate expected net advantage
        expected_net_advantage = net_equity - baseline_liquid + cashflow_gap
        
        # Check identity
        error = abs(net_advantage - expected_net_advantage)
        if error > 1e-6:
            errors.append(error)
            failed_years.append(year)
    
    print("\nTesting net advantage accounting identity...")
    print(f"Years tested: {years_to_test}")
    print(f"Maximum error: {max(errors) if errors else 0:.10f}")
    print(f"Failed years: {len(failed_years)}")
    if failed_years:
        print(f"Years with errors: {failed_years}")
    
    assert not errors, f"Net advantage identity failed for years: {failed_years} with max error {max(errors):.10f}"
    print("✅ Net advantage accounting identity holds at all tested horizons")

def test_year_zero_special_case(analyzer):
    """
    Test that year 0 has the correct values (no rent, no owner costs, no closing costs).
    
    Year 0 should have:
    - net_advantage = 0 (down payment cancels out)
    - cashflow_gap = 0 (no rent or owner costs yet)
    - closing_costs = 0 (not paid yet)
    """
    pure_baseline_data = analyzer.pure_baseline_vs_buy_over_time(years=30)
    year_0_data = pure_baseline_data[0]
    
    print("\nTesting year 0 special case...")
    print(f"Year 0 net_advantage: {year_0_data.net_advantage}")
    print(f"Year 0 cashflow_gap: {year_0_data.cashflow_gap}")
    print(f"Year 0 closing_costs: {year_0_data.components['closing_costs']}")
    
    # Year 0 should have net advantage = 0
    assert abs(year_0_data.net_advantage) < 1e-6, f"Year 0 net advantage should be 0, got {year_0_data.net_advantage}"
    
    # Year 0 should have cashflow gap = 0
    assert abs(year_0_data.cashflow_gap) < 1e-6, f"Year 0 cashflow gap should be 0, got {year_0_data.cashflow_gap}"
    
    # Year 0 should have closing costs = 0
    assert abs(year_0_data.components['closing_costs']) < 1e-6, f"Year 0 closing costs should be 0, got {year_0_data.components['closing_costs']}"
    
    print("✅ Year 0 special case is correct")

def test_component_signs_and_magnitudes(analyzer):
    """
    Test that component signs and magnitudes are reasonable.
    
    This is a sanity check to ensure components make economic sense.
    """
    pure_baseline_data = analyzer.pure_baseline_vs_buy_over_time(years=30)
    year_30_data = pure_baseline_data[30]
    components = year_30_data.components
    
    print("\nTesting component signs and magnitudes...")
    print(f"Year 30 components: {components}")
    
    # Appreciation gain should be positive (house value grows)
    assert components["appreciation_gain"] > 0, f"Appreciation gain should be positive, got {components['appreciation_gain']}"
    
    # Principal built should be positive (principal is paid down)
    assert components["principal_built"] > 0, f"Principal built should be positive, got {components['principal_built']}"
    
    # Down payment should be positive (contributes to equity)
    assert components["down_payment"] > 0, f"Down payment should be positive, got {components['down_payment']}"
    
    # Opportunity cost of DP should be negative (foregone investment)
    assert components["opportunity_cost_dp"] < 0, f"Opportunity cost of DP should be negative, got {components['opportunity_cost_dp']}"
    
    # Rent avoided net should be positive (rent is avoided)
    assert components["rent_avoided_net"] > 0, f"Rent avoided net should be positive, got {components['rent_avoided_net']}"
    
    # Closing costs should be negative (upfront expense)
    assert components["closing_costs"] < 0, f"Closing costs should be negative, got {components['closing_costs']}"
    
    print("✅ Component signs and magnitudes are correct")

def test_consistency_across_endpoints(analyzer):
    """
    Test that both endpoints return identical results for the same inputs.
    
    This ensures that pure_baseline_wealth and net_advantage_over_time
    return consistent values.
    """
    # Test both endpoints
    pure_baseline_data = analyzer.pure_baseline_vs_buy_over_time(years=30)
    net_advantage_data = analyzer.net_advantage_over_time(years=30)
    
    print("\nTesting consistency across endpoints...")
    
    # Both should have the same number of data points
    assert len(pure_baseline_data) == len(net_advantage_data), f"Different number of data points: {len(pure_baseline_data)} vs {len(net_advantage_data)}"
    
    # Test key metrics at year 30
    year_30_pure = pure_baseline_data[30]
    year_30_net = net_advantage_data[30]
    
    # Net advantage should be identical
    error_net_adv = abs(year_30_pure.net_advantage - year_30_net["net_advantage"])
    assert error_net_adv < 1e-6, f"Net advantage mismatch: {year_30_pure.net_advantage} vs {year_30_net['net_advantage']}"
    
    # Cashflow gap should be identical
    error_cashflow = abs(year_30_pure.cashflow_gap - year_30_net["cashflow_gap"])
    assert error_cashflow < 1e-6, f"Cashflow gap mismatch: {year_30_pure.cashflow_gap} vs {year_30_net['cashflow_gap']}"
    
    print("✅ Endpoints are consistent")

if __name__ == "__main__":
    print("🧮 Running BrickFi-Lab Component Reconciliation Tests")
    pytest.main([__file__, "-v"])

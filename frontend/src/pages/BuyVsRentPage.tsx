import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Refresh, TrendingUp, TrendingDown, Download } from '@mui/icons-material';
import BuyVsRentForm from '../components/BuyVsRentForm';
import BuyVsRentCharts from '../components/BuyVsRentCharts';
import BuyVsRentSummary from '../components/BuyVsRentSummary';
import BuyVsRentWaterfall from '../components/BuyVsRentWaterfall';
import { useBuyVsRentAnalysis } from '../hooks/useBuyVsRentAnalysis';
import { BuyVsRentInputs } from '../types/buyVsRent';
import { buyVsRentApi } from '../utils/api';

const BuyVsRentPage: React.FC = () => {
  const [inputs, setInputs] = useState<BuyVsRentInputs | null>(null);
  const { analysis, sensitivity, pureBaseline, netAdvantage, loading, error, analyze, runSensitivity, runPureBaseline, runNetAdvantage } = useBuyVsRentAnalysis();

  const handleInputsChange = (newInputs: BuyVsRentInputs) => {
    setInputs(newInputs);
    analyze(newInputs);
    runPureBaseline(newInputs, 30, false, 0.05);
    runNetAdvantage(newInputs, 30);
  };

  const handleSensitivityAnalysis = () => {
    if (inputs) {
      // Create rate range around the current rate (±1%)
      const baseRate = inputs.annual_rate;
      const rates = [
        Math.max(0.01, baseRate - 0.02), // -2%
        Math.max(0.01, baseRate - 0.01), // -1%
        baseRate, // current
        baseRate + 0.01, // +1%
        baseRate + 0.02  // +2%
      ];
      
      // Create rent range around current rent (±20%)
      const baseRent = inputs.monthly_rent;
      const rents = [
        Math.round(baseRent * 0.8), // -20%
        Math.round(baseRent * 0.9), // -10%
        baseRent, // current
        Math.round(baseRent * 1.1), // +10%
        Math.round(baseRent * 1.2)  // +20%
      ];
      
      runSensitivity(inputs, rates, rents);
    }
  };

  const exportAnalysisForLLM = async () => {
    if (!inputs || !analysis) return;
    
    // Fetch additional API endpoints for complete export
    const [cashFlowData, houseValueData, investmentValueData, wealthComparisonData, pureRenterBaselineData] = await Promise.all([
      buyVsRentApi.cashFlow(inputs, 60).catch(() => null),
      buyVsRentApi.getHouseValueOverTime(inputs, 30).catch(() => null),
      buyVsRentApi.getInvestmentValueOverTime(inputs, 30).catch(() => null),
      buyVsRentApi.getWealthComparisonOverTime(inputs, 30).catch(() => null),
      buyVsRentApi.getPureRenterBaselineOverTime(inputs, 30).catch(() => null)
    ]);
    
    const exportData = {
      analysis_type: "Buy vs Rent Property Analysis",
      description: "Complete analysis comparing the costs of buying versus renting a property, including comprehensive data from all API endpoints with detailed explanations.",
      timestamp: new Date().toISOString(),
      accounting_identity_formula: "Net Advantage = Owner Equity - Baseline Wealth + Cashflow Gap - Closing Costs",
      inputs: {
        description: "User input parameters for the property analysis",
        property_details: {
          price: inputs.price,
          description: "Purchase price of the property in euros"
        },
        financial_parameters: {
          fees_pct: inputs.fees_pct,
          fees_pct_description: "Upfront purchase costs as percentage of property price (notary, registration, etc.)",
          down_payment: inputs.down_payment,
          down_payment_description: "Cash payment toward the purchase price in euros",
          annual_rate: inputs.annual_rate,
          annual_rate_description: "Fixed mortgage nominal annual interest rate",
          amortization_rate: inputs.amortization_rate,
          amortization_rate_description: "Yearly amortization rate (e.g., 0.045 for 4.5% per year)"
        },
        monthly_costs: {
          monthly_rent: inputs.monthly_rent,
          monthly_rent_description: "Comparable market rental price per month in euros",
          taxe_fonciere_monthly: inputs.taxe_fonciere_monthly,
          taxe_fonciere_description: "Monthly property tax equivalent in euros",
          insurance_monthly: inputs.insurance_monthly,
          insurance_description: "Borrower/homeowner insurance monthly cost in euros",
          maintenance_pct_annual: inputs.maintenance_pct_annual,
          maintenance_description: "Annual maintenance costs as percentage of property price",
          renter_insurance_monthly: inputs.renter_insurance_monthly,
          renter_insurance_description: "Optional renter insurance monthly cost in euros",
          rent_inflation_rate: inputs.rent_inflation_rate,
          rent_inflation_rate_description: "Annual rent inflation rate (e.g., 0.02 for 2% per year)"
        },
        investment_parameters: {
          house_appreciation_rate: inputs.house_appreciation_rate,
          house_appreciation_rate_description: "Annual house value appreciation rate (e.g., 0.02 for 2% per year)",
          investment_return_rate: inputs.investment_return_rate,
          investment_return_rate_description: "Annual investment return rate for down payment (e.g., 0.07 for 7% per year)"
        },
        analysis_options: {
          baseline_mode: inputs.baseline_mode,
          baseline_mode_description: "Comparison mode: 'pure_renter' (DP compounded independently) or 'budget_matched' (legacy approach)",
          sell_on_horizon: inputs.sell_on_horizon,
          sell_on_horizon_description: "Whether to sell the house at the evaluation horizon (30 years)"
        }
      },
      results: {
        description: "Analysis results comparing ownership vs rental costs",
        endpoint: "POST /api/buy-vs-rent/analyze",
        purpose: "Core financial analysis providing key metrics for buy vs rent decision",
        mortgage_details: {
          mortgage_amount: analysis.mortgage_amount,
          mortgage_amount_description: "Total loan amount after down payment in euros",
          monthly_PI: analysis.monthly_PI,
          monthly_PI_description: "Monthly principal and interest payment in euros",
          total_interest_paid: analysis.total_interest_paid,
          total_interest_paid_description: "Total interest paid over the entire loan term",
          calculated_loan_term_years: analysis.calculated_loan_term_years,
          calculated_loan_term_description: "Loan term calculated from amortization rate (1/amortization_rate)",
          yearly_amortization_rate: analysis.yearly_amortization_rate,
          yearly_amortization_rate_description: "Yearly amortization rate used for calculations"
        },
        cost_comparison: {
          owner_cost_month1: analysis.owner_cost_month1,
          owner_cost_description: "Total monthly cost of ownership (excluding principal) in first month - includes interest, taxes, insurance, maintenance",
          monthly_rent_total: analysis.monthly_rent_total,
          rent_cost_description: "Total monthly rental cost including insurance",
          owner_vs_rent_monthly: analysis.owner_vs_rent_monthly,
          monthly_difference_description: "Monthly cost difference (positive means ownership costs more)"
        },
        financial_metrics: {
          annual_saving_vs_rent: analysis.annual_saving_vs_rent,
          annual_saving_description: "Annual savings compared to renting (negative means renting is cheaper)",
          cash_payback_years: analysis.cash_payback_years,
          cash_payback_description: "Years until cumulative cash savings recover upfront costs (DP + fees)",
          wealth_breakeven_year: analysis.wealth_breakeven_year,
          wealth_breakeven_description: "Year when net advantage becomes positive"
        },
        wealth_comparison_metrics: {
          house_wealth_10_years: analysis.house_wealth_10_years,
          house_wealth_10_description: "Total house wealth (value - remaining mortgage) after 10 years",
          investment_wealth_10_years: analysis.investment_wealth_10_years,
          investment_wealth_10_description: inputs.baseline_mode === 'pure_renter' ? "Pure renter wealth (down payment compounded independently) after 10 years" : "Total investment wealth (rent+invest strategy) after 10 years",
          house_wealth_20_years: analysis.house_wealth_20_years,
          house_wealth_20_description: "Total house wealth (value - remaining mortgage) after 20 years",
          investment_wealth_20_years: analysis.investment_wealth_20_years,
          investment_wealth_20_description: inputs.baseline_mode === 'pure_renter' ? "Pure renter wealth (down payment compounded independently) after 20 years" : "Total investment wealth (rent+invest strategy) after 20 years",
          house_wealth_30_years: analysis.house_wealth_30_years,
          house_wealth_30_description: "Total house wealth (value - remaining mortgage) after 30 years",
          investment_wealth_30_years: analysis.investment_wealth_30_years,
          investment_wealth_30_description: inputs.baseline_mode === 'pure_renter' ? "Pure renter wealth (down payment compounded independently) after 30 years" : "Total investment wealth (rent+invest strategy) after 30 years",
          wealth_crossover_year: analysis.wealth_crossover_year,
          wealth_crossover_description: "Year when investment strategy overtakes house wealth (null if never)"
        },
        pure_baseline_metrics: {
          baseline_liquid_30_years: analysis.baseline_liquid_30_years,
          baseline_liquid_30_description: "Pure renter baseline wealth (down payment compounded) after 30 years",
          net_advantage_30_years: analysis.net_advantage_30_years,
          net_advantage_30_description: "Net advantage of buying vs pure renter baseline after 30 years",
          cashflow_gap_30_years: analysis.cashflow_gap_30_years,
          cashflow_gap_30_description: "Cumulative cashflow gap (rent - owner costs) after 30 years"
        }
      },
      sensitivity_analysis: sensitivity ? {
        description: "Sensitivity analysis showing how results vary with different interest rates and rental prices",
        endpoint: "POST /api/buy-vs-rent/sensitivity",
        purpose: "Tests robustness of buy vs rent decision under different market conditions",
        scenarios: sensitivity.map((result: any) => ({
          interest_rate: result.rate,
          interest_rate_description: "Mortgage interest rate tested in this scenario",
          rental_price: result.rent,
          rental_price_description: "Monthly rent tested in this scenario",
          owner_cost_m1: result.owner_cost_m1,
          owner_cost_description: "Monthly ownership cost (excluding principal) in first month",
          annual_saving: result.annual_saving,
          annual_saving_description: "Annual savings vs renting (negative means renting is cheaper)",
          cash_payback_years: result.cash_payback_years,
          cash_payback_description: "Years until cumulative cash savings recover upfront costs",
          scenario_description: `Scenario with ${(result.rate * 100).toFixed(2)}% interest rate and €${result.rent}/month rent`
        }))
      } : null,
      pure_baseline_analysis: pureBaseline && pureBaseline.length > 0 ? {
        description: "Pure renter baseline analysis - rate-independent comparison with component breakdown",
        endpoint: "POST /api/buy-vs-rent/pure-baseline-wealth",
        purpose: "Most comprehensive analysis implementing pure renter baseline specification with waterfall-friendly component breakdown",
        baseline_mode: inputs.baseline_mode,
        baseline_independence: "Pure renter baseline is completely independent of mortgage interest rates - down payment compounded at investment rate, rent treated as consumption",
        key_milestones: {
          year_5: pureBaseline.find((p: any) => p.year === 5) ? {
            year: 5,
            net_advantage: pureBaseline.find((p: any) => p.year === 5)?.net_advantage,
            net_advantage_description: "Net advantage of buying vs pure renter baseline (positive = buying better)",
            baseline_liquid: pureBaseline.find((p: any) => p.year === 5)?.baseline_liquid,
            baseline_liquid_description: "Pure renter wealth (down payment compounded at investment rate)",
            net_equity: pureBaseline.find((p: any) => p.year === 5)?.net_equity,
            net_equity_description: "Owner equity (house value - remaining mortgage balance)",
            cashflow_gap: pureBaseline.find((p: any) => p.year === 5)?.cashflow_gap,
            cashflow_gap_description: "Cumulative rent paid - cumulative owner costs",
            components: pureBaseline.find((p: any) => p.year === 5)?.components ? {
              appreciation_gain: pureBaseline.find((p: any) => p.year === 5)?.components.appreciation_gain,
              appreciation_gain_description: "House value growth over time (positive component)",
              principal_built: pureBaseline.find((p: any) => p.year === 5)?.components.principal_built,
              principal_built_description: "Equity accumulated through mortgage payments (positive component)",
              interest_drag: pureBaseline.find((p: any) => p.year === 5)?.components.interest_drag,
              interest_drag_description: "Total interest paid (negative component - cost of borrowing)",
              opportunity_cost_dp: pureBaseline.find((p: any) => p.year === 5)?.components.opportunity_cost_dp,
              opportunity_cost_dp_description: "Foregone investment returns on down payment (negative component)",
              rent_avoided_net: pureBaseline.find((p: any) => p.year === 5)?.components.rent_avoided_net,
              rent_avoided_net_description: "Net benefit from not paying rent (positive after loan payoff)",
              closing_costs: pureBaseline.find((p: any) => p.year === 5)?.components.closing_costs,
              closing_costs_description: "Upfront purchase costs (negative component)"
            } : null
          } : null,
          year_10: pureBaseline.find((p: any) => p.year === 10) ? {
            year: 10,
            net_advantage: pureBaseline.find((p: any) => p.year === 10)?.net_advantage,
            net_advantage_description: "Net advantage of buying vs pure renter baseline (positive = buying better)",
            baseline_liquid: pureBaseline.find((p: any) => p.year === 10)?.baseline_liquid,
            baseline_liquid_description: "Pure renter wealth (down payment compounded at investment rate)",
            net_equity: pureBaseline.find((p: any) => p.year === 10)?.net_equity,
            net_equity_description: "Owner equity (house value - remaining mortgage balance)",
            cashflow_gap: pureBaseline.find((p: any) => p.year === 10)?.cashflow_gap,
            cashflow_gap_description: "Cumulative rent paid - cumulative owner costs",
            components: pureBaseline.find((p: any) => p.year === 10)?.components ? {
              appreciation_gain: pureBaseline.find((p: any) => p.year === 10)?.components.appreciation_gain,
              appreciation_gain_description: "House value growth over time (positive component)",
              principal_built: pureBaseline.find((p: any) => p.year === 10)?.components.principal_built,
              principal_built_description: "Equity accumulated through mortgage payments (positive component)",
              interest_drag: pureBaseline.find((p: any) => p.year === 10)?.components.interest_drag,
              interest_drag_description: "Total interest paid (negative component - cost of borrowing)",
              opportunity_cost_dp: pureBaseline.find((p: any) => p.year === 10)?.components.opportunity_cost_dp,
              opportunity_cost_dp_description: "Foregone investment returns on down payment (negative component)",
              rent_avoided_net: pureBaseline.find((p: any) => p.year === 10)?.components.rent_avoided_net,
              rent_avoided_net_description: "Net benefit from not paying rent (positive after loan payoff)",
              closing_costs: pureBaseline.find((p: any) => p.year === 10)?.components.closing_costs,
              closing_costs_description: "Upfront purchase costs (negative component)"
            } : null
          } : null,
          year_20: pureBaseline.find((p: any) => p.year === 20) ? {
            year: 20,
            net_advantage: pureBaseline.find((p: any) => p.year === 20)?.net_advantage,
            net_advantage_description: "Net advantage of buying vs pure renter baseline (positive = buying better)",
            baseline_liquid: pureBaseline.find((p: any) => p.year === 20)?.baseline_liquid,
            baseline_liquid_description: "Pure renter wealth (down payment compounded at investment rate)",
            net_equity: pureBaseline.find((p: any) => p.year === 20)?.net_equity,
            net_equity_description: "Owner equity (house value - remaining mortgage balance)",
            cashflow_gap: pureBaseline.find((p: any) => p.year === 20)?.cashflow_gap,
            cashflow_gap_description: "Cumulative rent paid - cumulative owner costs",
            components: pureBaseline.find((p: any) => p.year === 20)?.components ? {
              appreciation_gain: pureBaseline.find((p: any) => p.year === 20)?.components.appreciation_gain,
              appreciation_gain_description: "House value growth over time (positive component)",
              principal_built: pureBaseline.find((p: any) => p.year === 20)?.components.principal_built,
              principal_built_description: "Equity accumulated through mortgage payments (positive component)",
              interest_drag: pureBaseline.find((p: any) => p.year === 20)?.components.interest_drag,
              interest_drag_description: "Total interest paid (negative component - cost of borrowing)",
              opportunity_cost_dp: pureBaseline.find((p: any) => p.year === 20)?.components.opportunity_cost_dp,
              opportunity_cost_dp_description: "Foregone investment returns on down payment (negative component)",
              rent_avoided_net: pureBaseline.find((p: any) => p.year === 20)?.components.rent_avoided_net,
              rent_avoided_net_description: "Net benefit from not paying rent (positive after loan payoff)",
              closing_costs: pureBaseline.find((p: any) => p.year === 20)?.components.closing_costs,
              closing_costs_description: "Upfront purchase costs (negative component)"
            } : null
          } : null,
          year_30: pureBaseline.find((p: any) => p.year === 30) ? {
            year: 30,
            net_advantage: pureBaseline.find((p: any) => p.year === 30)?.net_advantage,
            net_advantage_description: "Net advantage of buying vs pure renter baseline (positive = buying better)",
            baseline_liquid: pureBaseline.find((p: any) => p.year === 30)?.baseline_liquid,
            baseline_liquid_description: "Pure renter wealth (down payment compounded at investment rate)",
            net_equity: pureBaseline.find((p: any) => p.year === 30)?.net_equity,
            net_equity_description: "Owner equity (house value - remaining mortgage balance)",
            cashflow_gap: pureBaseline.find((p: any) => p.year === 30)?.cashflow_gap,
            cashflow_gap_description: "Cumulative rent paid - cumulative owner costs",
            components: pureBaseline.find((p: any) => p.year === 30)?.components ? {
              appreciation_gain: pureBaseline.find((p: any) => p.year === 30)?.components.appreciation_gain,
              appreciation_gain_description: "House value growth over time (positive component)",
              principal_built: pureBaseline.find((p: any) => p.year === 30)?.components.principal_built,
              principal_built_description: "Equity accumulated through mortgage payments (positive component)",
              interest_drag: pureBaseline.find((p: any) => p.year === 30)?.components.interest_drag,
              interest_drag_description: "Total interest paid (negative component - cost of borrowing)",
              opportunity_cost_dp: pureBaseline.find((p: any) => p.year === 30)?.components.opportunity_cost_dp,
              opportunity_cost_dp_description: "Foregone investment returns on down payment (negative component)",
              rent_avoided_net: pureBaseline.find((p: any) => p.year === 30)?.components.rent_avoided_net,
              rent_avoided_net_description: "Net benefit from not paying rent (positive after loan payoff)",
              closing_costs: pureBaseline.find((p: any) => p.year === 30)?.components.closing_costs,
              closing_costs_description: "Upfront purchase costs (negative component)"
            } : null
          } : null
        },
        interpretation: {
          net_advantage_meaning: "Positive values indicate buying is better than pure renter baseline",
          baseline_independence: "Pure renter baseline is completely independent of mortgage interest rates",
          component_breakdown: {
            appreciation_gain: "House value growth over time - leverage on property appreciation",
            principal_built: "Equity accumulated through mortgage payments - forced savings",
            interest_drag: "Total interest paid - cost of borrowing money",
            opportunity_cost_dp: "Foregone investment returns on down payment - what the down payment could have earned",
            rent_avoided_net: "Net benefit from not paying rent - becomes strongly positive after loan payoff",
            closing_costs: "Upfront purchase costs - one-time expense"
          }
        }
      } : null,
      net_advantage_over_time: netAdvantage && netAdvantage.length > 0 ? {
        description: "Net advantage over time analysis - shows how the advantage of buying vs pure renter baseline evolves",
        endpoint: "POST /api/buy-vs-rent/net-advantage-over-time",
        purpose: "Tracks the net advantage of buying over time with component breakdown",
        data_points: netAdvantage.map((point: any) => ({
          year: point.year,
          year_description: "Year in the analysis timeline",
          net_advantage: point.net_advantage,
          net_advantage_description: "Net advantage of buying vs pure renter baseline (positive = buying better)",
          baseline_liquid: point.baseline_liquid,
          baseline_liquid_description: "Pure renter wealth (down payment compounded at investment rate)",
          net_equity: point.net_equity,
          net_equity_description: "Owner equity (house value - remaining mortgage balance)",
          cashflow_gap: point.cashflow_gap,
          cashflow_gap_description: "Cumulative cashflow gap (rent - owner costs)",
          components: point.components ? {
            appreciation_gain: point.components.appreciation_gain,
            appreciation_gain_description: "House value growth over time (positive component)",
            principal_built: point.components.principal_built,
            principal_built_description: "Equity accumulated through mortgage payments (positive component)",
            interest_drag: point.components.interest_drag,
            interest_drag_description: "Total interest paid (negative component - cost of borrowing)",
            opportunity_cost_dp: point.components.opportunity_cost_dp,
            opportunity_cost_dp_description: "Foregone investment returns on down payment (negative component)",
            rent_avoided_net: point.components.rent_avoided_net,
            rent_avoided_net_description: "Net benefit from not paying rent (positive after loan payoff)",
            closing_costs: point.components.closing_costs,
            closing_costs_description: "Upfront purchase costs (negative component)"
          } : null
        })),
        interpretation: {
          net_advantage_evolution: "Shows how the advantage of buying evolves over time",
          key_insights: [
            "Early years: Often negative due to high interest costs and opportunity cost of down payment",
            "Mid-term: May become positive as equity builds and rent costs accumulate",
            "Long-term: Typically positive due to rent avoidance and house appreciation",
            "Component breakdown shows which factors drive the net advantage"
          ]
        }
      } : null,
      cash_flow_analysis: cashFlowData ? {
        description: "Monthly cash flow analysis showing detailed breakdown of ownership costs",
        endpoint: "POST /api/buy-vs-rent/cash-flow",
        purpose: "Provides month-by-month breakdown of ownership costs including principal, interest, taxes, insurance, and maintenance",
        data_points: cashFlowData.slice(0, 12).map((month: any) => ({
          month: month.month,
          month_description: "Month number from start of ownership",
          principal: month.principal,
          principal_description: "Principal portion of mortgage payment",
          interest: month.interest,
          interest_description: "Interest portion of mortgage payment",
          property_tax: month.property_tax,
          property_tax_description: "Monthly property tax equivalent",
          insurance: month.insurance,
          insurance_description: "Monthly insurance cost",
          maintenance: month.maintenance,
          maintenance_description: "Monthly maintenance cost",
          total_cost: month.total_cost,
          total_cost_description: "Total monthly ownership cost"
        })),
        interpretation: [
          "Shows how ownership costs are distributed between principal, interest, and other expenses",
          "Principal payments build equity while interest payments are pure cost",
          "Other costs (taxes, insurance, maintenance) continue even after loan payoff"
        ]
      } : null,
      house_value_over_time: houseValueData ? {
        description: "House value appreciation over time analysis",
        endpoint: "POST /api/buy-vs-rent/house-value-over-time",
        purpose: "Tracks how the property value grows over time based on appreciation rate",
        data_points: houseValueData.filter((point: any) => [5, 10, 15, 20, 25, 30].includes(point.year)).map((point: any) => ({
          year: point.year,
          year_description: "Years from purchase",
          house_value: point.house_value,
          house_value_description: "Property value based on appreciation rate",
          appreciation_gain: point.appreciation_gain,
          appreciation_gain_description: "Total appreciation gain from original purchase price"
        })),
        interpretation: [
          "Shows compound growth of property value over time",
          "Appreciation gain represents wealth building through property ownership",
          "Important for long-term wealth comparison vs investment alternatives"
        ]
      } : null,
      investment_value_over_time: investmentValueData ? {
        description: "Investment portfolio value over time analysis",
        endpoint: "POST /api/buy-vs-rent/investment-value-over-time",
        purpose: "Tracks how the down payment would grow if invested in the market",
        data_points: investmentValueData.filter((point: any) => [5, 10, 15, 20, 25, 30].includes(point.year)).map((point: any) => ({
          year: point.year,
          year_description: "Years from initial investment",
          investment_value: point.investment_value,
          investment_value_description: "Value of down payment invested at market return rate",
          total_return: point.total_return,
          total_return_description: "Total return on investment from original down payment"
        })),
        interpretation: [
          "Shows opportunity cost of using down payment for property vs investing",
          "Represents the baseline for comparing property ownership returns",
          "Critical for understanding the true cost of property ownership"
        ]
      } : null,
      wealth_comparison_over_time: wealthComparisonData ? {
        description: "Comprehensive wealth comparison between property ownership and investment strategy",
        endpoint: "POST /api/buy-vs-rent/wealth-comparison-over-time",
        purpose: "Compares total wealth accumulation between buying property vs renting and investing",
        data_points: wealthComparisonData.filter((point: any) => [5, 10, 15, 20, 25, 30].includes(point.year)).map((point: any) => ({
          year: point.year,
          year_description: "Years from start of analysis",
          house_wealth: point.house_wealth,
          house_wealth_description: "Total house wealth (value - remaining mortgage)",
          investment_wealth: point.investment_wealth,
          investment_wealth_description: "Total investment wealth (rent+invest strategy)",
          wealth_difference: point.wealth_difference,
          wealth_difference_description: "Difference between house wealth and investment wealth (positive = house better)"
        })),
        interpretation: [
          "Shows which strategy builds more wealth over time",
          "House wealth includes equity building and appreciation",
          "Investment wealth includes market returns and rent savings",
          "Crossover point indicates when one strategy becomes superior"
        ]
      } : null,
      pure_renter_baseline_over_time: pureRenterBaselineData ? {
        description: "Pure renter baseline analysis over time",
        endpoint: "POST /api/buy-vs-rent/pure-renter-baseline-over-time",
        purpose: "Shows how down payment would grow if invested independently (rate-independent baseline)",
        data_points: pureRenterBaselineData.filter((point: any) => [5, 10, 15, 20, 25, 30].includes(point.year)).map((point: any) => ({
          year: point.year,
          year_description: "Years from initial investment",
          baseline_liquid: point.baseline_liquid,
          baseline_liquid_description: "Pure renter wealth (down payment compounded at investment rate)",
          cumul_rent: point.cumul_rent,
          cumul_rent_description: "Cumulative rent paid (treated as consumption)",
          net_advantage: point.net_advantage,
          net_advantage_description: "Net advantage of buying vs pure renter baseline"
        })),
        interpretation: [
          "Pure renter baseline is completely independent of mortgage rates",
          "Down payment grows at investment rate, rent is treated as consumption",
          "Net advantage shows true benefit of property ownership vs pure investment",
          "Most transparent comparison for buy vs rent decision"
        ]
      } : null,
      interpretation: {
        summary: analysis.annual_saving_vs_rent >= 0 
          ? "Based on this analysis, buying appears more cost-effective than renting in the short term."
          : "Based on this analysis, renting appears more cost-effective than buying in the short term.",
        key_factors: [
          "This analysis includes comprehensive wealth comparison with equity building and property appreciation",
          "Break-even calculation considers when equity gains offset higher ownership costs",
          "Property appreciation and investment returns are included in the wealth comparison analysis",
          "Tax benefits of homeownership may not be fully captured"
        ]
      }
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buy-vs-rent-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Buy vs Rent Analysis
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive buy vs rent analysis including wealth comparison, net advantage calculation, and component breakdown. 
        This analysis considers ownership costs, property appreciation, investment returns, and long-term wealth building 
        to help you make an informed decision.
      </Typography>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Property & Financial Details
            </Typography>
            <BuyVsRentForm 
              onInputsChange={handleInputsChange}
              loading={loading}
            />
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} lg={8}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {analysis && (
            <>
              {/* Summary Cards */}
              <BuyVsRentSummary analysis={analysis} inputs={inputs} />

              {/* Charts */}
              <Paper sx={{ p: 3, mt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Analysis Charts
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={handleSensitivityAnalysis}
                      disabled={loading}
                    >
                      Run Sensitivity Analysis
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={exportAnalysisForLLM}
                      disabled={!analysis}
                      color="secondary"
                    >
                      Export for LLM
                    </Button>
                  </Box>
                </Box>
                
                <BuyVsRentCharts 
                  analysis={analysis} 
                  inputs={inputs || undefined}
                  sensitivity={sensitivity || undefined}
                  loading={loading}
                />
              </Paper>
            </>
          )}

          {pureBaseline && pureBaseline.length > 0 && (
            <Grid item xs={12}>
              <BuyVsRentWaterfall data={pureBaseline} horizonYears={30} />
            </Grid>
          )}

          {!analysis && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Enter property details to begin analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill out the form on the left to see your buy vs rent comparison
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default BuyVsRentPage;

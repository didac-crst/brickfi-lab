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
  Chip,
} from '@mui/material';
import { Refresh, TrendingUp, Lock, Schedule, Download } from '@mui/icons-material';
import ForwardTrackerForm from '../components/ForwardTrackerForm';
import ForwardTrackerCharts from '../components/ForwardTrackerCharts';
import ForwardDecisionSummary from '../components/ForwardDecisionSummary';
import { useForwardTracker } from '../hooks/useForwardTracker';
import { ForwardDecisionInputs } from '../types/forwardTracker';

const ForwardTrackerPage: React.FC = () => {
  const [inputs, setInputs] = useState<ForwardDecisionInputs | null>(null);
  const { 
    decision, 
    premiumSchedule, 
    loading, 
    error, 
    makeDecision, 
    analyzePremiumSchedule 
  } = useForwardTracker();

  const handleInputsChange = (newInputs: ForwardDecisionInputs) => {
    setInputs(newInputs);
    makeDecision(newInputs);
  };

  const handlePremiumAnalysis = () => {
    if (inputs) {
      analyzePremiumSchedule(inputs, 36);
    }
  };

  const getDecisionColor = (decision: string) => {
    switch (decision) {
      case 'LOCK_10Y':
        return 'success';
      case 'TAKE_5Y':
        return 'info';
      case 'WAIT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getDecisionIcon = (decision: string) => {
    switch (decision) {
      case 'LOCK_10Y':
        return <Lock />;
      case 'TAKE_5Y':
        return <TrendingUp />;
      case 'WAIT':
        return <Schedule />;
      default:
        return undefined;
    }
  };

  const exportAnalysisForLLM = () => {
    if (!inputs || !decision) return;
    
    const exportData = {
      analysis_type: "Forward Rate Tracker Decision Analysis",
      description: "Analysis of forward-loaded mortgage rates to determine optimal timing for rate locking decisions, considering market conditions and individual financial parameters.",
      timestamp: new Date().toISOString(),
      inputs: {
        description: "Input parameters used for forward rate decision analysis",
        market_conditions: {
          spot_10y: inputs.spot_10y,
          spot_10y_description: "Current 10-year all-in mortgage rate (percentage)",
          spot_5y: inputs.spot_5y,
          spot_5y_description: "Current 5-year all-in mortgage rate (percentage)",
          lead_months: inputs.lead_months,
          lead_months_description: "Number of months until mortgage is needed"
        },
        financial_details: {
          loan_amount: inputs.loan_amount,
          loan_amount_description: "Requested mortgage amount in euros"
        },
        decision_rules: {
          lock_10y_le: inputs.rules.lock_10y_le,
          lock_10y_le_description: "No-regret 10-year lock threshold (percentage) - lock if forward rate is at or below this",
          lock_10y_alt: inputs.rules.lock_10y_alt,
          lock_10y_alt_description: "Alternative 10-year lock threshold (percentage) - secondary decision point",
          min_5y_discount_bp: inputs.rules.min_5y_discount_bp,
          min_5y_discount_description: "Minimum advantage in basis points that 5-year rate must have over 10-year to prefer 5-year option",
          small_loan_threshold: inputs.rules.small_loan_threshold,
          small_loan_threshold_description: "Loan amount threshold below which small loan surcharge applies (euros)",
          small_loan_surcharge_bp: inputs.rules.small_loan_surcharge_bp,
          small_loan_surcharge_description: "Additional basis points charged for loans below threshold"
        },
        premium_schedule: {
          free_months: inputs.schedule.free_months,
          free_months_description: "Number of months with no forward premium charge",
          premium_pp_per_month: inputs.schedule.premium_pp_per_month,
          premium_description: "Forward premium charge per month in percentage points (after free period)"
        }
      },
      decision_result: {
        description: "Automated decision recommendation based on current market conditions and user rules",
        recommendation: decision.decision,
        reasoning: decision.reason,
        forward_10y_rate: decision.forward_10y_rate,
        forward_rate_description: "Calculated forward-loaded 10-year rate including premiums and surcharges",
        diagnostics: decision.diagnostics ? {
          market_rates: {
            spot_10y_rate: decision.diagnostics.spot_10y,
            forward_10y_rate: decision.diagnostics.fwd_10y,
            spot_5y_rate: decision.diagnostics.spot_5y || null
          },
          calculations: {
            lead_time_months: decision.diagnostics.lead_months,
            forward_premium_pp: decision.diagnostics.premium_pp,
            small_loan_surcharge_bp: decision.diagnostics.small_loan_surcharge_bp,
            discount_5y_over_10y_bp: decision.diagnostics.discount_5y_bp || null
          },
          decision_thresholds: {
            lock_10y_threshold: decision.diagnostics.lock_10y_le,
            alternative_threshold: decision.diagnostics.lock_10y_alt,
            min_5y_discount_required: decision.diagnostics.min_5y_discount_bp
          }
        } : null
      },
      premium_schedule_analysis: premiumSchedule ? {
        description: "Analysis of how forward premiums affect rates over different lead times",
        analysis_points: {
          months_analyzed: premiumSchedule.months,
          months_description: "Lead times analyzed (months ahead)",
          premium_costs: premiumSchedule.premiums,
          premiums_description: "Forward premium costs for each lead time (percentage points)",
          forward_rates_10y: premiumSchedule.forward_rates,
          forward_rates_description: "Calculated forward-loaded 10-year rates for each lead time",
          recommended_decisions: premiumSchedule.decisions,
          decisions_description: "Recommended decision for each lead time scenario"
        },
        scenarios: premiumSchedule.months.map((months: number, index: number) => ({
          months_ahead: months,
          forward_rate_10y: premiumSchedule.forward_rates[index],
          premium_cost_pp: premiumSchedule.premiums[index],
          recommended_decision: premiumSchedule.decisions[index],
          scenario_description: `${months} months ahead: ${premiumSchedule.forward_rates[index]?.toFixed(3)}% forward rate, decision: ${premiumSchedule.decisions[index]}`
        }))
      } : null,
      interpretation: {
        decision_explanation: (() => {
          const explanations = {
            "LOCK_10Y": "Lock the 10-year rate now - current forward rate is attractive",
            "TAKE_5Y": "Choose the 5-year rate - it offers significant savings over the 10-year option",
            "WAIT": "Wait before making a decision - current conditions don't favor locking"
          };
          return explanations[decision.decision as keyof typeof explanations] || "Unknown decision type";
        })(),
        key_factors: [
          "Forward rates include premiums for future rate locks",
          "Small loan surcharges apply to loans below the threshold",
          "5-year rates are preferred only when they offer substantial savings over 10-year rates",
          "Decision rules are designed to optimize long-term mortgage costs while managing interest rate risk"
        ],
        market_context: inputs.spot_5y && decision.diagnostics?.discount_5y_bp 
          ? `5-year rate offers ${Math.round(decision.diagnostics.discount_5y_bp)} basis points advantage over 10-year rate`
          : "Only 10-year rate analysis available"
      }
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `forward-tracker-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Forward Rate Tracker
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Analyze forward-loaded mortgage rates and make optimal timing decisions for refinancing. 
        This tool helps you decide when to lock rates based on forward premiums and your risk tolerance.
      </Typography>

      <Grid container spacing={3}>
        {/* Input Form */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 'fit-content', position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              Market Conditions & Rules
            </Typography>
            <ForwardTrackerForm 
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

          {decision && (
            <>
              {/* Decision Summary */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Decision Recommendation
                  </Typography>
                  <Chip
                    icon={getDecisionIcon(decision.decision)}
                    label={decision.decision}
                    color={getDecisionColor(decision.decision) as any}
                    variant="filled"
                    size="medium"
                  />
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {decision.reason}
                </Typography>
                <ForwardDecisionSummary decision={decision} />
              </Paper>

              {/* Charts */}
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Analysis Charts
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<Refresh />}
                      onClick={handlePremiumAnalysis}
                      disabled={loading}
                    >
                      Analyze Premium Schedule
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Download />}
                      onClick={exportAnalysisForLLM}
                      disabled={!decision}
                      color="secondary"
                    >
                      Export for LLM
                    </Button>
                  </Box>
                </Box>
                
                <ForwardTrackerCharts 
                  decision={decision} 
                  premiumSchedule={premiumSchedule || undefined}
                  loading={loading}
                />
              </Paper>
            </>
          )}

          {!decision && !loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Enter market conditions to begin analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Fill out the form on the left to see your forward rate decision recommendation
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ForwardTrackerPage;

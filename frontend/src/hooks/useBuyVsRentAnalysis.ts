import { useState } from 'react';
import { BuyVsRentInputs, BuyVsRentSummary, SensitivityResult, PureBaselinePoint } from '../types/buyVsRent';
import { buyVsRentApi } from '../utils/api';

export const useBuyVsRentAnalysis = () => {
  const [analysis, setAnalysis] = useState<BuyVsRentSummary | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pureBaseline, setPureBaseline] = useState<PureBaselinePoint[] | null>(null);
  const [netAdvantage, setNetAdvantage] = useState<any[] | null>(null);

  const analyze = async (inputs: BuyVsRentInputs) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await buyVsRentApi.analyze(inputs);
      setAnalysis(result);
    } catch (err: any) {
      // Handle validation errors properly
      const errorData = err.response?.data?.detail;
      if (Array.isArray(errorData)) {
        // Format validation errors
        const errorMessages = errorData.map((error: any) => 
          `${error.loc?.join('.')}: ${error.msg}`
        );
        setError(errorMessages.join('; '));
      } else if (typeof errorData === 'string') {
        setError(errorData);
      } else {
        setError('Analysis failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const runSensitivity = async (inputs: BuyVsRentInputs, rates: number[], rents: number[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await buyVsRentApi.sensitivity({
        base_inputs: inputs,
        rates,
        rents,
        sell_cost_pct: 0.05,
      });
      setSensitivity(result);
    } catch (err: any) {
      // Handle validation errors properly
      const errorData = err.response?.data?.detail;
      if (Array.isArray(errorData)) {
        // Format validation errors
        const errorMessages = errorData.map((error: any) => 
          `${error.loc?.join('.')}: ${error.msg}`
        );
        setError(errorMessages.join('; '));
      } else if (typeof errorData === 'string') {
        setError(errorData);
      } else {
        setError('Sensitivity analysis failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    analysis,
    sensitivity,
    pureBaseline,
    netAdvantage,
    loading,
    error,
    analyze,
    runSensitivity,
    runPureBaseline: async (inputs: BuyVsRentInputs, years = 30, sellOnHorizon = false, sellCostPct = 0.05) => {
      try {
        const data = await buyVsRentApi.pureBaselineWealth(inputs, years, sellOnHorizon, sellCostPct);
        setPureBaseline(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to compute pure baseline wealth');
      }
    },
    runNetAdvantage: async (inputs: BuyVsRentInputs, years = 30) => {
      try {
        const data = await buyVsRentApi.getNetAdvantageOverTime(inputs, years);
        setNetAdvantage(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to compute net advantage over time');
      }
    },
  };
};

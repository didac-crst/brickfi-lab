import { useState } from 'react';
import { BuyVsRentInputs, BuyVsRentSummary, SensitivityResult } from '../types/buyVsRent';
import { buyVsRentApi } from '../utils/api';

export const useBuyVsRentAnalysis = () => {
  const [analysis, setAnalysis] = useState<BuyVsRentSummary | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    loading,
    error,
    analyze,
    runSensitivity,
  };
};

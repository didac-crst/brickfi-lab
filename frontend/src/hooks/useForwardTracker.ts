import { useState } from 'react';
import { ForwardDecisionInputs, ForwardDecisionResult, PremiumScheduleAnalysis } from '../types/forwardTracker';
import { forwardTrackerApi } from '../utils/api';

export const useForwardTracker = () => {
  const [decision, setDecision] = useState<ForwardDecisionResult | null>(null);
  const [premiumSchedule, setPremiumSchedule] = useState<PremiumScheduleAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeDecision = async (inputs: ForwardDecisionInputs) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await forwardTrackerApi.makeDecision(inputs);
      setDecision(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Decision analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzePremiumSchedule = async (inputs: ForwardDecisionInputs, maxMonths: number = 36) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await forwardTrackerApi.analyzePremiumSchedule(inputs, maxMonths);
      setPremiumSchedule(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Premium schedule analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    decision,
    premiumSchedule,
    loading,
    error,
    makeDecision,
    analyzePremiumSchedule,
  };
};

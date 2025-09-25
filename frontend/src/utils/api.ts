import axios from 'axios';
import { BuyVsRentInputs, BuyVsRentSummary, SensitivityResult, CashFlowData, PureBaselinePoint } from '../types/buyVsRent';
import { ForwardDecisionInputs, ForwardDecisionResult, PremiumScheduleAnalysis } from '../types/forwardTracker';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Buy vs Rent API calls
export const buyVsRentApi = {
  analyze: async (inputs: BuyVsRentInputs, sellCostPct: number = 0.05): Promise<BuyVsRentSummary> => {
    const response = await api.post(`/api/buy-vs-rent/analyze?sell_cost_pct=${sellCostPct}`, inputs);
    return response.data;
  },

  sensitivity: async (inputs: {
    base_inputs: BuyVsRentInputs;
    rates: number[];
    rents: number[];
    sell_cost_pct: number;
  }): Promise<SensitivityResult[]> => {
    const response = await api.post('/api/buy-vs-rent/sensitivity', inputs);
    return response.data;
  },

  cashFlow: async (inputs: BuyVsRentInputs, months: number = 60): Promise<CashFlowData[]> => {
    const response = await api.post(`/api/buy-vs-rent/cash-flow?months=${months}`, inputs);
    return response.data;
  },

  getDefaultInputs: async (): Promise<BuyVsRentInputs> => {
    const response = await api.get('/api/buy-vs-rent/default-inputs');
    return response.data;
  },

  getHouseValueOverTime: async (inputs: BuyVsRentInputs, years: number = 30) => {
    const response = await api.post(`/api/buy-vs-rent/house-value-over-time?years=${years}`, inputs);
    return response.data;
  },

  getInvestmentValueOverTime: async (inputs: BuyVsRentInputs, years: number = 30) => {
    const response = await api.post(`/api/buy-vs-rent/investment-value-over-time?years=${years}`, inputs);
    return response.data;
  },

      getWealthComparisonOverTime: async (inputs: BuyVsRentInputs, years: number = 30) => {
        const response = await api.post(`/api/buy-vs-rent/wealth-comparison-over-time?years=${years}`, inputs);
        return response.data;
      },

      getPureRenterBaselineOverTime: async (inputs: BuyVsRentInputs, years: number = 30) => {
        const response = await api.post(`/api/buy-vs-rent/pure-renter-baseline-over-time?years=${years}`, inputs);
        return response.data;
      },

      getNetAdvantageOverTime: async (inputs: BuyVsRentInputs, years: number = 30) => {
        const response = await api.post(`/api/buy-vs-rent/net-advantage-over-time?years=${years}`, inputs);
        return response.data;
      },

      pureBaselineWealth: async (
        inputs: BuyVsRentInputs,
        years: number = 30,
        sellOnHorizon: boolean = false,
        sellCostPct: number = 0.05
      ): Promise<PureBaselinePoint[]> => {
        const response = await api.post('/api/buy-vs-rent/pure-baseline-wealth', inputs, {
          params: { years, sell_on_horizon: sellOnHorizon, sell_cost_pct: sellCostPct },
        });
        return response.data;
      },
};

// Forward Tracker API calls
export const forwardTrackerApi = {
  makeDecision: async (inputs: ForwardDecisionInputs): Promise<ForwardDecisionResult> => {
    const response = await api.post('/api/forward-tracker/decision', inputs);
    return response.data;
  },

  analyzePremiumSchedule: async (inputs: ForwardDecisionInputs, maxMonths: number = 36): Promise<PremiumScheduleAnalysis> => {
    const response = await api.post(`/api/forward-tracker/premium-schedule?max_months=${maxMonths}`, inputs);
    return response.data;
  },

  getDefaultInputs: async (): Promise<ForwardDecisionInputs> => {
    const response = await api.get('/api/forward-tracker/default-inputs');
    return response.data;
  },

  getRateScenarios: async () => {
    const response = await api.get('/api/forward-tracker/rate-scenarios');
    return response.data;
  },
};

export default api;

import { GameState, Role } from '../types';

const ENGINEER_GROWTH_PER_DEV = 1000;
const SALES_GROWTH_PER_SALES = 5000;
const REFERRAL_BASE_PER_MARKETING = 50; // small bonus scaled by quality
const CHURN_BASE_RATE = 0.015;
const MRR_PER_CS = 80000; // CS1人あたりMRR対応目安

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const calculateCSPenalty = (state: GameState) => {
  const currentMRR = state.kpi.MRR;
  const numCS = state.employees.filter(e => e.role === Role.CS).length;
  const requiredCS = currentMRR / MRR_PER_CS;
  if (requiredCS <= 0 || numCS >= requiredCS) return 0;
  const shortageRatio = clamp((requiredCS - numCS) / requiredCS, 0, 1);
  return currentMRR * CHURN_BASE_RATE * shortageRatio;
};

export const calculateMarketingReferralBonus = (state: GameState) => {
  const numMarketing = state.employees.filter(e => e.role === Role.MARKETER).length;
  const productQuality = state.productQuality ?? Math.max(0, 100 - state.tech_debt);
  return REFERRAL_BASE_PER_MARKETING * numMarketing * (productQuality / 100);
};

export const applyMRRUpdate = (state: GameState): GameState => {
  const productQuality = state.productQuality ?? Math.max(0, 100 - state.tech_debt);
  const numEngineers = state.employees.filter(e => e.role === Role.ENGINEER).length;
  const numSales = state.employees.filter(e => e.role === Role.SALES).length;

  const engineerGrowth = ENGINEER_GROWTH_PER_DEV * numEngineers * (productQuality / 100);
  const salesGrowth = SALES_GROWTH_PER_SALES * numSales;
  const marketingBonus = calculateMarketingReferralBonus(state);
  const csPenalty = calculateCSPenalty(state);

  const newMRR = Math.max(0, state.kpi.MRR + engineerGrowth + salesGrowth + marketingBonus - csPenalty);

  return {
    ...state,
    productQuality,
    kpi: { ...state.kpi, MRR: newMRR }
  };
};

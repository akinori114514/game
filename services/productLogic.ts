import { GameState, ProductPhase, Role } from '../types';

type PhaseMeta = {
  id: ProductPhase;
  label: string;
  min: number;
  max: number;
  priceMultiplier: number;
  description: string;
};

export const PRODUCT_PHASES: PhaseMeta[] = [
  { id: ProductPhase.PROTOTYPE, label: 'プロトタイプ', min: 0,  max: 20, priceMultiplier: 0.65, description: '未完成。知人向けの実験段階。' },
  { id: ProductPhase.VALIDATION, label: '検証中',      min: 20, max: 40, priceMultiplier: 0.85, description: '仮説検証フェーズ。口コミ頼り。' },
  { id: ProductPhase.EARLY_PMF,  label: '初期PMF',     min: 40, max: 60, priceMultiplier: 1.1, description: '手応えあり。初期ユーザーが定着。' },
  { id: ProductPhase.PMF,        label: 'PMF確立',     min: 60, max: 80, priceMultiplier: 1.4, description: '市場適合。単価と需要が増加。' },
  { id: ProductPhase.SCALE,      label: 'スケール',     min: 80, max: 101, priceMultiplier: 1.9, description: 'ブランド化。大型契約が狙える。' }
];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const determineProductPhase = (pmf: number): PhaseMeta => {
  const score = clamp(pmf, 0, 100);
  const phase = PRODUCT_PHASES.find(p => score >= p.min && score < p.max) || PRODUCT_PHASES[PRODUCT_PHASES.length - 1];
  return phase;
};

export const calculateAverageUnitPrice = (state: GameState): number => {
  const pmf = state.pmf_score ?? 0;
  const quality = state.productQuality ?? Math.max(0, 100 - state.tech_debt);
  const salesCount = state.employees.filter(e => e.role === Role.SALES).length;
  const csCount = state.employees.filter(e => e.role === Role.CS).length;
  const currentMRR = state.kpi?.MRR ?? 0;

  const phase = determineProductPhase(pmf);

  const basePrice = 50000;
  const qualityFactor = clamp(0.6 + (quality / 100), 0.6, 1.5);
  const salesFactor = clamp(1 + salesCount * 0.06, 1, 1.35);

  // CS不足による単価低下
  const requiredCS = currentMRR > 0 ? currentMRR / 80000 : 0;
  const shortageRatio = requiredCS > 0 ? clamp((requiredCS - csCount) / requiredCS, 0, 1) : 0;
  const csFactor = clamp(1 - 0.25 * shortageRatio, 0.6, 1);

  const price = basePrice * phase.priceMultiplier * qualityFactor * salesFactor * csFactor;
  return Math.round(price);
};

export const updateProductSnapshot = (state: GameState, pmfBaseline: number): GameState => {
  const productQuality = state.productQuality ?? Math.max(0, 100 - state.tech_debt);
  const phaseMeta = determineProductPhase(state.pmf_score);
  const averageUnitPrice = calculateAverageUnitPrice({ ...state, productQuality });
  const lastPmfDelta = (state.pmf_score ?? 0) - (pmfBaseline ?? state.pmf_score ?? 0);

  return {
    ...state,
    productQuality,
    productPhase: phaseMeta.id,
    averageUnitPrice,
    lastPmfDelta
  };
};

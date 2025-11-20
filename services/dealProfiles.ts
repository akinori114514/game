import { Phase, SalesTarget } from '../types';

export interface DealProfile {
  target: SalesTarget;
  label: string;
  resistance: number;
  moves: number;
  mrr: number;
  minPhase: Phase;
  minPMF: number;
  requiresSales: boolean;
}

const phaseOrder: Record<Phase, number> = {
  SEED: 0,
  SERIES_A: 1,
  SERIES_B: 2,
};

const isPhaseLocked = (current: Phase, required: Phase) => {
  return phaseOrder[current] < phaseOrder[required];
};

const pickByPhase = (phase: Phase, values: { SEED: number; SERIES_A: number; SERIES_B: number }) => {
  return values[phase];
};

export const getDealProfile = (target: SalesTarget, phase: Phase): DealProfile | null => {
  switch (target) {
    case 'FRIENDS': {
      return {
        target,
        label: '友人・知人',
        resistance: pickByPhase(phase, { SEED: 30, SERIES_A: 40, SERIES_B: 50 }),
        moves: 3,
        mrr: pickByPhase(phase, { SEED: 10000, SERIES_A: 20000, SERIES_B: 40000 }),
        minPhase: Phase.SEED,
        minPMF: 0,
        requiresSales: false,
      };
    }
    case 'STARTUP': {
      return {
        target,
        label: 'スタートアップ',
        resistance: pickByPhase(phase, { SEED: 60, SERIES_A: 70, SERIES_B: 80 }),
        moves: 3,
        mrr: pickByPhase(phase, { SEED: 50000, SERIES_A: 100000, SERIES_B: 150000 }),
        minPhase: Phase.SEED,
        minPMF: 25,
        requiresSales: false,
      };
    }
    case 'ENTERPRISE': {
      if (isPhaseLocked(phase, Phase.SERIES_A)) return null;
      return {
        target,
        label: '大手企業',
        resistance: pickByPhase(phase, { SEED: 200, SERIES_A: 140, SERIES_B: 120 }),
        moves: 4,
        mrr: pickByPhase(phase, { SEED: 0, SERIES_A: 350000, SERIES_B: 700000 }),
        minPhase: Phase.SERIES_A,
        minPMF: 50,
        requiresSales: true,
      };
    }
    case 'WHALE': {
      if (isPhaseLocked(phase, Phase.SERIES_B)) return null;
      return {
        target,
        label: '超巨大コングロマリット (WHALE)',
        resistance: 220,
        moves: 5,
        mrr: 2500000,
        minPhase: Phase.SERIES_B,
        minPMF: 70,
        requiresSales: true,
      };
    }
    default:
      return null;
  }
};

export const getDealGateMessage = ({
  target,
  phase,
  pmfScore,
  hasSales,
}: {
  target: SalesTarget;
  phase: Phase;
  pmfScore: number;
  hasSales: boolean;
}) => {
  const profile = getDealProfile(target, phase);
  if (!profile) return '現在のフェーズでは受付停止';
  if (phaseOrder[phase] < phaseOrder[profile.minPhase]) return 'フェーズが不足';
  if (pmfScore < profile.minPMF) return `PMF ${profile.minPMF}+ が必要`;
  if (profile.requiresSales && !hasSales) return '営業人員が必要';
  return '';
};

import { Phase, GameState, MajorEvent, InvestorType } from '../types';
import { calculateDealSuccess } from './salesLogic';
import { applyTemporaryDifficultyModifier } from './difficultyModifier';
import { updateInvestorReputation } from './investors';

type TriggerOptions = {
  force?: boolean;
};

const MAX_EVENTS: Record<Phase, number> = {
  [Phase.SEED]: 1,
  [Phase.SERIES_A]: 1,
  [Phase.SERIES_B]: 2
};

const MIN_EVENTS: Record<Phase, number> = {
  [Phase.SEED]: 1,
  [Phase.SERIES_A]: 1,
  [Phase.SERIES_B]: 1
};

const seedEvents: MajorEvent[] = [
  {
    id: 'seed_collab',
    label: '某メガベンチャーとの緊急コラボ',
    type: 'BRAND',
    phase: Phase.SEED,
    resistance: 70,
    rewardMRR: 60000,
    rewardBuffTurns: 3,
    rewardBuffModifier: 0.15,
    eventSuccessModifier: 1.05,
    moves: 4,
    favoredBy: [InvestorType.PRODUCT, InvestorType.FAMILY]
  },
  {
    id: 'seed_bigdeal',
    label: '行政案件への潜り込み',
    type: 'BIG_DEAL',
    phase: Phase.SEED,
    resistance: 90,
    rewardMRR: 90000,
    rewardBuffTurns: 2,
    rewardBuffModifier: 0.12,
    eventSuccessModifier: 1.0,
    moves: 4,
    dislikedBy: [InvestorType.FAMILY]
  }
];

const seriesAEvents: MajorEvent[] = [
  {
    id: 'seriesA_brand',
    label: 'テレビ露出とブランド連携',
    type: 'BRAND',
    phase: Phase.SERIES_A,
    resistance: 130,
    rewardMRR: 220000,
    rewardBuffTurns: 4,
    rewardBuffModifier: 0.18,
    eventSuccessModifier: 0.9,
    moves: 5,
    favoredBy: [InvestorType.PRODUCT, InvestorType.FAMILY]
  },
  {
    id: 'seriesA_deal',
    label: '上場企業との年契約',
    type: 'BIG_DEAL',
    phase: Phase.SERIES_A,
    resistance: 150,
    rewardMRR: 320000,
    rewardBuffTurns: 3,
    rewardBuffModifier: 0.15,
    eventSuccessModifier: 0.85,
    moves: 5,
    dislikedBy: [InvestorType.PRODUCT]
  }
];

const seriesBEvents: MajorEvent[] = [
  {
    id: 'seriesB_whale',
    label: '海外コングロマリット案件',
    type: 'BIG_DEAL',
    phase: Phase.SERIES_B,
    resistance: 210,
    rewardMRR: 650000,
    rewardBuffTurns: 4,
    rewardBuffModifier: 0.2,
    eventSuccessModifier: 0.75,
    moves: 5,
    favoredBy: [InvestorType.BLITZ]
  },
  {
    id: 'seriesB_brand',
    label: '世界的ブランドとの共同発表',
    type: 'BRAND',
    phase: Phase.SERIES_B,
    resistance: 180,
    rewardMRR: 400000,
    rewardBuffTurns: 5,
    rewardBuffModifier: 0.22,
    eventSuccessModifier: 0.85,
    moves: 5,
    favoredBy: [InvestorType.PRODUCT, InvestorType.FAMILY]
  },
  {
    id: 'seriesB_random',
    label: '予測不能なバズイベント',
    type: 'RANDOM',
    phase: Phase.SERIES_B,
    resistance: 190,
    rewardMRR: 360000,
    rewardBuffTurns: 3,
    rewardBuffModifier: 0.18,
    eventSuccessModifier: 0.9,
    moves: 5,
    failureCostSales: 200000,
    failureCostDev: 8,
    dislikedBy: [InvestorType.FAMILY]
  }
];

const getPoolForPhase = (phase: Phase) => {
  switch (phase) {
    case Phase.SEED:
      return seedEvents;
    case Phase.SERIES_A:
      return seriesAEvents;
    case Phase.SERIES_B:
      return seriesBEvents;
    default:
      return seedEvents;
  }
};

const pickEvent = (events: MajorEvent[]) => events[Math.floor(Math.random() * events.length)];

export const triggerMajorEvent = (
  phase: Phase,
  state: GameState,
  options: TriggerOptions = {}
): MajorEvent | null => {
  if (state.active_major_event) return null;
  const counts = state.majorEventCountByPhase || {
    [Phase.SEED]: 0,
    [Phase.SERIES_A]: 0,
    [Phase.SERIES_B]: 0
  };

  const currentCount = counts[phase] || 0;
  const max = MAX_EVENTS[phase] ?? 0;
  if (currentCount >= max) return null;

  if (!options.force) {
    const minimum = MIN_EVENTS[phase] ?? 0;
    if (currentCount < minimum) return null;
    if (phase === Phase.SERIES_B && currentCount === 1) {
      if (Math.random() < 0.5) return null;
    } else {
      return null;
    }
  }

  return pickEvent(getPoolForPhase(phase));
};

export const calculateMajorEventSuccess = (
  event: MajorEvent,
  playerState: {
    pmf: number;
    salesCount: number;
    productQuality: number;
  },
  cardEffects: number
) => {
  let chance = calculateDealSuccess(
    playerState.pmf,
    playerState.salesCount,
    playerState.productQuality,
    cardEffects,
    event.resistance
  );
  chance *= event.eventSuccessModifier;
  return Math.max(0.05, Math.min(0.95, chance));
};

export const applyMajorEventOutcome = (
  event: MajorEvent,
  success: boolean,
  state: GameState
): GameState => {
  let nextState = { ...state };

  if (success) {
    if (event.rewardMRR) {
      nextState.kpi = { ...nextState.kpi, MRR: nextState.kpi.MRR + event.rewardMRR };
    }
    if (event.rewardBuffTurns && event.rewardBuffModifier) {
      nextState = applyTemporaryDifficultyModifier(
        nextState,
        event.rewardBuffTurns,
        event.rewardBuffModifier
      );
    }
  } else {
    if (event.failureCostSales) {
      nextState.cash = Math.max(0, nextState.cash - event.failureCostSales);
    }
    if (event.failureCostDev) {
      nextState.tech_debt += event.failureCostDev;
    }
  }

  nextState.investors = nextState.investors.map((investor) =>
    updateInvestorReputation(event.type, success, investor)
  );

  return nextState;
};

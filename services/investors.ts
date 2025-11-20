import { InvestorType, InvestorState, MajorEventType } from '../types';

interface InvestorPreference {
  favoredEventTypes: MajorEventType[];
  dislikedEventTypes: MajorEventType[];
}

const REPUTATION_MAX = 100;
const REPUTATION_MIN = -100;
const FAVOR_BONUS = 6;
const NEUTRAL_BONUS = 2;
const DISLIKE_PENALTY = 4;

const INVESTOR_PREFERENCES: Record<InvestorType, InvestorPreference> = {
  [InvestorType.NONE]: { favoredEventTypes: [], dislikedEventTypes: [] },
  [InvestorType.BLITZ]: { favoredEventTypes: ['BIG_DEAL'], dislikedEventTypes: ['RANDOM'] },
  [InvestorType.PRODUCT]: { favoredEventTypes: ['BRAND'], dislikedEventTypes: ['BIG_DEAL'] },
  [InvestorType.FAMILY]: { favoredEventTypes: ['BRAND'], dislikedEventTypes: ['RANDOM'] }
};

const clampReputation = (value: number) => Math.max(REPUTATION_MIN, Math.min(REPUTATION_MAX, value));

export const updateInvestorReputation = (
  eventType: MajorEventType,
  success: boolean,
  investor: InvestorState
): InvestorState => {
  const pref = INVESTOR_PREFERENCES[investor.type] || INVESTOR_PREFERENCES[InvestorType.NONE];
  const isFavored = pref.favoredEventTypes.includes(eventType);
  const isDisliked = pref.dislikedEventTypes.includes(eventType);

  let delta = 0;
  if (success) {
    if (isFavored) delta = FAVOR_BONUS;
    else if (!isDisliked) delta = NEUTRAL_BONUS;
  } else {
    if (isFavored) delta = -FAVOR_BONUS;
    else if (isDisliked) delta = -DISLIKE_PENALTY;
    else delta = -NEUTRAL_BONUS;
  }

  return {
    ...investor,
    reputation: clampReputation(investor.reputation + delta)
  };
};

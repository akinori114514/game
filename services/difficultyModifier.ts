import { GameState, DifficultyModifier } from '../types';

export const applyTemporaryDifficultyModifier = (
  state: GameState,
  duration: number,
  modifier: number
): GameState => {
  const newModifier: DifficultyModifier = { remainingWeeks: duration, modifier };
  return { ...state, difficulty_modifier: newModifier };
};

export const tickDifficultyModifier = (state: GameState): GameState => {
  if (!state.difficulty_modifier) return state;
  const remaining = state.difficulty_modifier.remainingWeeks - 1;
  if (remaining <= 0) {
    return { ...state, difficulty_modifier: undefined };
  }
  return {
    ...state,
    difficulty_modifier: {
      ...state.difficulty_modifier,
      remainingWeeks: remaining
    }
  };
};

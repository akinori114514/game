import { GameState, InvestorType, Role } from "../types";

const fmtYen = (v: number) => `¥${Math.round(v).toLocaleString()}`;

export const getVCAdvice = async (state: GameState): Promise<string> => {
  const growth = (state.kpi.growth_rate_mom * 100);
  const runway = state.runway_months;
  const hasSales = state.employees.some(e => e.role === Role.SALES);
  const debt = state.tech_debt;
  const sanity = state.sanity;
  const pmf = state.pmf_score;
  const cash = state.cash;
  const mrr = state.kpi.MRR;

  if (state.investor_type === InvestorType.BLITZ) {
      const pressure = growth < 20 ? `成長${growth.toFixed(0)}%？遅い。広告を燃やしてでも30%超に乗せろ。` : `その調子だ、毎週成長を積め。`;
      const cashLine = runway < 3 ? `キャッシュは${runway.toFixed(1)}ヶ月分。赤字は気にするな、数字だけ死守しろ。` : `キャッシュ ${fmtYen(cash)}、まだ燃やせる。`;
      return `${pressure} ${cashLine}`;
  }

  if (state.investor_type === InvestorType.PRODUCT) {
      const salesHate = hasSales ? `営業を雇うな。コードで勝て。` : `営業なしで行け。`;
      const debtWarn = debt > 40 ? `技術的負債 ${debt}%。今すぐ返済しろ。` : `負債は許容内だ。プロダクトの質を上げろ。`;
      const pmfLine = pmf < 50 ? `PMF ${pmf} は足りない。顧客インタビューを増やせ。` : `PMF ${pmf}、このまま深く磨け。`;
      return `${salesHate} ${debtWarn} ${pmfLine}`;
  }

  if (state.investor_type === InvestorType.FAMILY) {
      const cashLine = runway < 3 ? `ランウェイ ${runway.toFixed(1)}ヶ月。社員の給与は守れるか？` : `キャッシュ ${fmtYen(cash)}、まずは安定を続けろ。`;
      const sanityLine = sanity < 40 ? `社長のSAN値 ${sanity}。少し休め。` : ``;
      return `背伸びするな。解雇はするな。${cashLine} ${sanityLine}`.trim();
  }

  // NONE / Seed mentorなし
  const generic = [];
  if (growth < 10) generic.push(`伸びが鈍い。小さくても毎週の成長を作れ。`);
  if (runway < 3) generic.push(`ランウェイ ${runway.toFixed(1)}ヶ月。無駄な固定費を削れ。`);
  if (mrr < 100000) generic.push(`まずはMRR ${fmtYen(100000)}を目指せ。`);
  return generic.join(' ') || `数字を積め。ログを残せ。`;
};

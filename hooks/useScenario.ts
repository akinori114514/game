
import { GameState, NarrativeEvent, Phase, InvestorType } from '../types';

export const useScenario = () => {
  
  const checkTriggers = (state: GameState): NarrativeEvent | null => {
    
    // --- TUTORIAL (CHAOS BOOTCAMP) ---
    
    // Week 3: The Reality Check (Unlock Side Gig)
    if (state.week === 3 && state.phase === Phase.SEED) {
        return {
            id: 'tut_side_gig',
            title: '現実的な選択',
            description: '資金が減り始めています。昔の知人から「Web制作の手伝い」を頼まれました。\n\n「3日で60万円払うよ。悪い話じゃないだろ？」',
            severity: 'NORMAL',
            choices: [
                {
                    id: 'tut_gig_yes',
                    label: '受ける (現金+60万 / Tech Debt増)',
                    description: '背に腹は代えられない。自社プロダクト開発は止まる。',
                    effect: (s) => ({
                        cash: s.cash + 600000,
                        tech_debt: s.tech_debt + 20,
                        sanity: s.sanity - 5
                    })
                },
                {
                    id: 'tut_gig_no',
                    label: '断る (Sanity維持)',
                    description: 'プロダクトに集中する。金はない。',
                    effect: (s) => ({
                        sanity: s.sanity + 5,
                        pmf_score: s.pmf_score + 2
                    })
                }
            ]
        };
    }

    // Week 6: The Hiring Trap (Unlock Recruit)
    if (state.week === 6 && state.phase === Phase.SEED) {
        return {
            id: 'tut_recruit',
            title: '友人のエンジニア',
            description: '大学時代の優秀な友人が転職を考えているようです。\n「お前の会社、面白そうだな。入ってもいいぜ？」\n\n彼は優秀ですが、給料は高いです。',
            severity: 'NORMAL',
            choices: [
                {
                    id: 'tut_hire_yes',
                    label: '採用する (Burn増 / PMF加速)',
                    description: '月給80万円。開発スピードは倍になる。',
                    effect: (s) => ({
                        employees: [...s.employees, {
                            id: 'star_eng', name: 'Star Engineer', role: 'ENGINEER',
                            stats: { tech: 90, sales: 10, management: 20 },
                            salary: 800000, motivation: 100, is_new_hire: false, manager_id: null, culture: 'INNOVATION'
                        }],
                        cash: s.cash - 500000, // Hiring bonus
                        pmf_score: s.pmf_score + 20
                    })
                },
                {
                    id: 'tut_hire_no',
                    label: '見送る',
                    description: '今は固定費を上げる時期ではない。',
                    effect: (s) => ({
                        sanity: s.sanity - 5
                    })
                }
            ]
        };
    }

    // Week 8: The Series A Pitch (Exit Tutorial)
    if (state.week === 8 && state.phase === Phase.SEED && state.mentor_type === InvestorType.NONE) {
      return {
        id: 'mentor_choice',
        title: 'シリーズA：運命の選択',
        description: "創業から2ヶ月。あなたのスタートアップに興味を持つ3人の投資家が現れました。\n誰の手を取るかで、会社の「OS」が書き換わります。",
        severity: 'CRITICAL',
        choices: [
          {
            id: 'mentor_blitz',
            label: 'SoftBank Style (BLITZ)',
            description: '「3億円出す。来月までに成長率30%必達だ。」(赤字上等/急成長)',
            philosophy_delta: { ruthlessness: 10, loneliness: 5 },
            effect: (s) => ({
              investor_type: InvestorType.BLITZ,
              phase: Phase.SERIES_A,
              cash: s.cash + 300000000,
              marketing_budget: s.marketing_budget + 1000000,
              sanity: s.sanity - 10
            })
          },
          {
            id: 'mentor_product',
            label: 'Tech VC (PRODUCT)',
            description: '「2億円出す。営業は雇うな。コードを書け。」(技術至上/営業禁止)',
            philosophy_delta: { craftsmanship: 15, ruthlessness: -5 },
            effect: (s) => ({
              investor_type: InvestorType.PRODUCT,
              phase: Phase.SERIES_A,
              cash: s.cash + 200000000,
              tech_debt: 0,
              pmf_score: s.pmf_score + 10
            })
          },
          {
            id: 'mentor_family',
            label: 'Regional Bank (FAMILY)',
            description: '「1億円融資します。社員を大切にしてください。」(安定/解雇禁止)',
            philosophy_delta: { ruthlessness: -10, craftsmanship: -5 },
            effect: (s) => ({
              investor_type: InvestorType.FAMILY,
              phase: Phase.SERIES_A,
              cash: s.cash + 100000000,
              sanity: 100
            })
          }
        ]
      };
    }

    // ... Standard Events (Same as before) ...
    if (state.phase === Phase.SERIES_A && state.kpi.MRR >= 5000000) {
        return {
            id: 'series_b_round',
            title: 'シリーズB：拡大の痛み',
            description: 'MRR 500万円達成。組織は30人を超え、もはや「顔の見える関係」ではなくなりました。',
            severity: 'CRITICAL',
            choices: [
                {
                    id: 'series_b_go',
                    label: '更なる高みへ',
                    effect: (s) => ({
                        phase: Phase.SERIES_B,
                        cash: s.cash + 500000000,
                        sanity: s.sanity - 20
                    })
                }
            ]
        };
    }

    return null;
  };

  return { checkTriggers };
};

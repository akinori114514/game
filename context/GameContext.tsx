import { createContext, useContext, useState, useMemo, useEffect, ReactNode } from 'react';
import { GameState, Role, Phase, Employee, CoFounderType, SalesTarget, NarrativeEvent, InvestorType, PhilosophyProfile, GameNotification, NotificationType, PricingStrategy, FloatingText, CultureType, SocialPost, SocialReplyOption, MarketTrend, LogEntry, MajorEvent } from '../types';
import { useScenario } from '../hooks/useScenario';
import { useNotificationSystem } from '../hooks/useNotificationSystem';
import { useGameEngine } from '../hooks/useGameEngine';
import { playSfx } from '../services/sfx';
import { triggerMajorEvent, applyMajorEventOutcome } from '../services/majorEvents';
import { getDealProfile } from '../services/dealProfiles';

interface GameContextProps {
  gameState: GameState;
  monthlyBurn: number;
  nextTurn: () => void;
  hireEmployee: (role: Role) => void;
  fireEmployee: (id: string) => void;
  assignManager: (employeeId: string, managerId: string | null) => void;
  adjustMarketingBudget: (amount: number) => void;
  setPricingStrategy: (strategy: PricingStrategy) => void;
  startSalesPitch: (target?: SalesTarget) => void;
  completeSalesPitch: (
    target: SalesTarget,
    win: boolean,
    sideEffects: { techDebt: number; sanityCost: number; cashCost: number },
    metadata?: { successChance?: number; majorEventId?: string; customLabel?: string; isMajorEvent?: boolean }
  ) => void;
  handlePrivateAction: (type: 'WORK' | 'FAMILY') => void;
  clickGoldenLead: () => void;
  resolveIncident: () => void;
  chooseCoFounder: (type: CoFounderType) => void;
  doCustomerInterview: () => void;
  doClientWork: () => void;
  applyForSubsidy: () => void;
  resolveEvent: (choiceId: string) => void;
  
  // SNS
  openSocialPost: (postId: string) => void;
  closeSocialPost: () => void;
  replyToSocialPost: (replyId: string) => void;

  isSalesModalOpen: boolean;
  salesModalTarget: SalesTarget | undefined;
  closeSalesModal: () => void;
  getUITheme: () => { bg: string; text: string; border: string; accent: string; font: string };
  canUseCommand: (command: 'SALES' | 'FIRE' | 'PIVOT' | 'RECRUIT' | 'SIDE_GIG') => boolean;
  floatingTexts: FloatingText[];
  activeMajorEvent: MajorEvent | null;
  
  // Notification Logic
  unreadCount: number;
  markAllAsRead: () => void;
  playSound: (type: 'notification' | 'error' | 'success' | 'click') => void;

  // Language
  lang: 'ja' | 'en';
  setLanguage: (lang: 'ja' | 'en') => void;
}

const InitialState: GameState = {
  date: '2020-04-01',
  week: 0,
  cash: 5000000, // Lower starting cash for difficulty
  runway_months: 6,
  sanity: 80,
  phase: Phase.SEED,
  pmf_score: 0,
  co_founder: null,
  employees: [],
  kpi: { MRR: 0, churn_rate: 0.02, CAC: 0, LTV: 0, growth_rate_mom: 0 },
  marketing_budget: 0,
  leads: 0,
  tech_debt: 0,
  hiring_friction_weeks: 0,
  actionPoints: 3,
  maxActionPoints: 3,
  turnNumber: 0,
  seedInitialSalesMissionsLeft: 3,
  mentor_type: InvestorType.NONE,
  investor_type: InvestorType.NONE,
  last_month_mrr: 0,
  pricing_strategy: PricingStrategy.PLG,
  market_trend: MarketTrend.NORMAL,
  flags: {
    has_received_subsidy: false,
    cto_left: false,
    competitor_attacked: false,
    pmf_frozen: false,
    spaghetti_code_crisis: false,
    down_round_count: 0,
    feature_creep_months: 0,
    boiled_frog_months: 0,
    market_trend_weeks_left: 8,
    is_interview_unlocked: true, // Always available
    is_side_gig_unlocked: false,
    is_recruit_unlocked: false,
    has_triggered_seed_event: false,
    has_triggered_series_a_event: false,
    series_b_event_count: 0
  },
  active_event: null,
  philosophy: { ruthlessness: 0, craftsmanship: 0, dishonesty: 0, loneliness: 0 },
  family_relationship: 90,
  is_machine_mode: false,
  is_decision_mode: false,
  is_game_over: false,
  notifications: [],
  logs: [
      { id: 'init', week: 0, message: '会社設立。東京はロックダウン直前。手持ち資金は500万円。', type: 'INFO', timestamp: Date.now() }
  ],
  whale_opportunity: false,
  active_social_post: null,
  fired_employees_history: [],
  investors: [{ type: InvestorType.NONE, reputation: 0 }],
  difficulty_modifier: undefined,
  active_major_event: null,
  majorEventCountByPhase: {
    [Phase.SEED]: 0,
    [Phase.SERIES_A]: 0,
    [Phase.SERIES_B]: 0
  }
};

const GameContext = createContext<GameContextProps | undefined>(undefined);

const createLogEntry = (
  base: GameState,
  message: string,
  type: LogEntry['type'] = 'INFO'
): LogEntry => ({
  id: `${Date.now()}_${Math.random()}`,
  week: base.week,
  message,
  type,
  timestamp: Date.now()
});

const appendLog = (base: GameState, message: string, type: LogEntry['type'] = 'INFO') => {
  return [...base.logs, createLogEntry(base, message, type)];
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(InitialState);
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [salesModalTarget, setSalesModalTarget] = useState<SalesTarget | undefined>(undefined);
  const [turnBonuses, setTurnBonuses] = useState({ goldenLeadHit: false, incidentsResolved: 0 });
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [lang, setLanguage] = useState<'ja' | 'en'>('ja');
  
  const playSound = (type: 'notification' | 'error' | 'success' | 'click') => {
      playSfx(type);
  };

  // Hooks
  const attemptMajorEvent = (force = false) => {
      setGameState(prev => {
          if (!force && prev.active_major_event) return prev;
          const event = triggerMajorEvent(prev.phase, prev, { force });
          if (!event) return prev;
          const counts = prev.majorEventCountByPhase || { [Phase.SEED]: 0, [Phase.SERIES_A]: 0, [Phase.SERIES_B]: 0 };
          const updatedCounts = { ...counts, [prev.phase]: (counts[prev.phase] || 0) + 1 };
          return {
              ...prev,
              active_major_event: event,
              majorEventCountByPhase: updatedCounts,
              logs: appendLog(prev, `大型イベント発生: ${event.label}`, 'EVENT')
          };
      });
  };

  useEffect(() => {
      if (!gameState.flags.has_triggered_seed_event) {
          setGameState(prev => {
              const ev = triggerMajorEvent(prev.phase, prev, { force: true });
              if (!ev) return prev;
              const counts = prev.majorEventCountByPhase || { [Phase.SEED]: 0, [Phase.SERIES_A]: 0, [Phase.SERIES_B]: 0 };
              const updatedCounts = { ...counts, [prev.phase]: (counts[prev.phase] || 0) + 1 };
              return {
                  ...prev,
                  active_major_event: ev,
                  majorEventCountByPhase: updatedCounts,
                  flags: { ...prev.flags, has_triggered_seed_event: true },
                  logs: appendLog(prev, `大型イベント発生: ${ev.label}`, 'EVENT')
              };
          });
      }
  }, [gameState.phase]);

  useEffect(() => {
      if (gameState.phase === Phase.SERIES_B) {
          attemptMajorEvent(false);
      }
  }, [gameState.week]);

  useEffect(() => {
      setGameState(prev => {
          const main = prev.investors[0];
          if (main && main.type === prev.investor_type) return prev;
          const investors = prev.investors.length > 0
              ? [{ ...prev.investors[0], type: prev.investor_type }, ...prev.investors.slice(1)]
              : [{ type: prev.investor_type, reputation: 0 }];
          return { ...prev, investors };
      });
  }, [gameState.investor_type]);

  const { addNotification, unreadCount, markAllAsRead, socialPostsCache } = useNotificationSystem(gameState, setGameState, playSound);
  const { monthlyBurn, nextTurn: engineNextTurn, withMachineModeCheck } = useGameEngine(gameState, setGameState, addNotification);

  const nextTurn = () => {
      playSound('click');
      engineNextTurn(turnBonuses, () => setTurnBonuses({ goldenLeadHit: false, incidentsResolved: 0 }));
      
      setGameState(prev => {
          const week = prev.week + 1;
          let logs = [...prev.logs];

          // --- CHAOS BOOTCAMP LOGIC (WEEKS 1-8) ---
          let event = prev.active_event;
          const flags = { ...prev.flags };

          // Week 3: Unlock Side Gig
          if (week === 3) {
             flags.is_side_gig_unlocked = true;
             addNotification('SYSTEM', 'New Command Unlocked: SIDE GIG');
             logs.push({ id: 'unlock_gig', week, message: '【機能解放】受託開発(副業)が可能になりました。', type: 'SUCCESS', timestamp: Date.now() });
          }

          // Week 6: Unlock Recruit
          if (week === 6) {
             flags.is_recruit_unlocked = true;
             addNotification('SYSTEM', 'New Command Unlocked: RECRUIT');
             logs.push({ id: 'unlock_recruit', week, message: '【機能解放】社員の採用が可能になりました。', type: 'SUCCESS', timestamp: Date.now() });
          }

          // Decay Relationship
          let decay = 2;
          if (prev.is_machine_mode) decay = 5;
          if (prev.phase === Phase.SERIES_B) decay = 3;
          const newRel = Math.max(0, prev.family_relationship - decay);

          return {
              ...prev,
              flags,
              family_relationship: newRel,
              logs: [...logs, { id: `turn_${week}`, week, message: `Week ${week} started. Cash: ¥${(prev.cash/10000).toFixed(0)}万`, type: 'INFO', timestamp: Date.now() }]
          };
      });
  };

  // --- Action Handlers ---

  const addFloatingText = (text: string, color: string) => {
      const id = Date.now().toString() + Math.random();
      const x = 30 + Math.random() * 40;
      const y = 40 + Math.random() * 20;
      setFloatingTexts(prev => [...prev, { id, text, x, y, color }]);
      setTimeout(() => {
          setFloatingTexts(prev => prev.filter(ft => ft.id !== id));
      }, 2000);
  };

  const doClientWork = () => {
      playSound('click');
      setGameState(prev => {
          const updated = withMachineModeCheck({
              ...prev,
              cash: prev.cash + 600000,
              tech_debt: prev.tech_debt + 5, // Dirty hacks for client
              flags: { ...prev.flags, pmf_frozen: true },
              sanity: Math.max(0, prev.sanity - 10),
              philosophy: { 
                  ...prev.philosophy, 
                  craftsmanship: prev.philosophy.craftsmanship - 2,
                  dishonesty: prev.philosophy.dishonesty + 2 
              }
          });
          return { ...updated, logs: appendLog(updated, '受託開発で急場を凌いだ。(+¥60万, Tech Debt +5)', 'WARNING') };
      });
      addFloatingText("+¥600,000", "text-emerald-400 font-bold text-xl");
      setTimeout(() => nextTurn(), 100);
  };

  const doCustomerInterview = () => {
      playSound('click');
      if (gameState.actionPoints <= 0) {
          addNotification('SYSTEM', '今週の行動ポイントが足りません');
          return;
      }
      if (gameState.cash < 50000) return;
      setGameState(prev => {
          const ap = Math.max(0, prev.actionPoints - 1);
          const updated = {
              ...prev,
              cash: prev.cash - 50000,
              pmf_score: Math.min(100, prev.pmf_score + 5), 
              sanity: Math.min(100, prev.sanity + 5),
              philosophy: { 
                  ...prev.philosophy, 
                  craftsmanship: prev.philosophy.craftsmanship + 2 
              },
              actionPoints: ap
          };
          return { ...updated, logs: appendLog(updated, '顧客ヒアリングを実施。PMFの兆しが見えた。', 'SUCCESS') };
      });
      addNotification('SLACK', 'ユーザーインタビューの示唆を得た。');
  };

  const hireEmployee = (role: Role) => {
    playSound('click');
    const costAP = role === Role.ENGINEER ? 2 : 1;
    if (gameState.actionPoints < costAP) {
      addNotification('SYSTEM', '行動ポイントが足りません');
      return;
    }
    if (gameState.cash < 500000) return; 
    let salary = 600000; 
    if (gameState.investor_type === InvestorType.BLITZ) salary = 900000;
    if (role === Role.MANAGER) salary = 800000;

    let culture: CultureType = CultureType.INNOVATION;
    if (role === Role.CS || role === Role.MANAGER) {
        culture = Math.random() > 0.3 ? CultureType.STABILITY : CultureType.INNOVATION;
    } else {
        culture = Math.random() > 0.7 ? CultureType.STABILITY : CultureType.INNOVATION;
    }

    const newEmp: Employee = {
      id: `emp_${Date.now()}`,
      name: "New Hire",
      role,
      salary,
      stats: { tech: 50, sales: 50, management: 50 },
      motivation: 80,
      is_new_hire: true,
      manager_id: null,
      culture
    };

    setGameState(prev => {
      const updated = {
        ...prev,
        employees: [...prev.employees, newEmp],
        cash: prev.cash - 300000, 
        hiring_friction_weeks: 4,
        actionPoints: Math.max(0, prev.actionPoints - costAP)
      };
      return { ...updated, logs: appendLog(updated, `${role}を採用した。(月給: ¥${(salary/10000).toFixed(0)}万)`, 'INFO') };
    });
    const roleNames: Record<Role, string> = {
      ENGINEER: 'エンジニア',
      SALES: '営業',
      CS: 'CS',
      MARKETER: 'マーケター',
      MANAGER: 'マネージャー'
    };
    const roleLabel = roleNames[role] || 'メンバー';
    addNotification('SLACK', `新しい${roleLabel}がチームに加入！ 🎉`);
  };

  const fireEmployee = (id: string) => {
      playSound('error');
      setGameState(prev => {
          const firedEmp = prev.employees.find(e => e.id === id);
          const firedHistory = firedEmp ? [...prev.fired_employees_history, { name: firedEmp.name, role: firedEmp.role, date: prev.date }] : prev.fired_employees_history;

          const nextState = withMachineModeCheck({
              ...prev,
              employees: prev.employees.filter(e => e.id !== id),
              sanity: Math.max(0, prev.sanity - 15),
              cash: prev.cash - 1000000, 
              philosophy: { 
                  ...prev.philosophy, 
                  ruthlessness: prev.philosophy.ruthlessness + 10,
                  loneliness: prev.philosophy.loneliness + 5
              },
              fired_employees_history: firedHistory
          });
          return { ...nextState, logs: appendLog(nextState, '社員を解雇した。組織に動揺が走る。', 'CRITICAL') };
      });
  };

  const resolveEvent = (choiceId: string) => {
      playSound('click');
      setGameState(prev => {
          if (!prev.active_event) return prev;
          const choice = prev.active_event.choices.find(c => c.id === choiceId);
          if (!choice) return prev;
          const effectUpdates = choice.effect(prev);
          
          // Merge philosophy
          const newPhilosophy = { ...prev.philosophy };
          if (choice.philosophy_delta) {
              newPhilosophy.ruthlessness += (choice.philosophy_delta.ruthlessness || 0);
              newPhilosophy.craftsmanship += (choice.philosophy_delta.craftsmanship || 0);
              newPhilosophy.dishonesty += (choice.philosophy_delta.dishonesty || 0);
              newPhilosophy.loneliness += (choice.philosophy_delta.loneliness || 0);
          }
          
          const stillCritical = effectUpdates.cash !== undefined && effectUpdates.cash < 0;
          
          const choiceLog = createLogEntry(prev, `決断: ${choice.label}`, 'WARNING');

          return withMachineModeCheck({
              ...prev,
              ...effectUpdates,
              philosophy: newPhilosophy,
              active_event: null,
              is_decision_mode: stillCritical,
              logs: [...prev.logs, choiceLog]
          });
      });
  };

  const startSalesPitch = (target?: SalesTarget) => {
      playSound('click');
      const reqAP = 2;
      const isEvent = !!gameState.active_major_event;
      const isSeedMission = gameState.phase === Phase.SEED && (gameState.seedInitialSalesMissionsLeft || 0) > 0;
      const isEmergency = gameState.kpi.MRR < (monthlyBurn || 1) * 0.8;

      if (!isEvent && !isSeedMission && !isEmergency) {
          addNotification('SYSTEM', '今は特別な案件のみ営業可能です');
          return;
      }
      if (!isEvent && gameState.actionPoints < reqAP) {
          addNotification('SYSTEM', '今週の行動ポイントが足りません');
          return;
      }

      if (!isEvent) {
          setGameState(prev => ({
              ...prev,
              actionPoints: prev.actionPoints - reqAP,
              seedInitialSalesMissionsLeft: prev.phase === Phase.SEED && prev.seedInitialSalesMissionsLeft ? prev.seedInitialSalesMissionsLeft - 1 : prev.seedInitialSalesMissionsLeft
          }));
      }

      if (gameState.active_major_event) {
          setSalesModalTarget(undefined);
      } else {
          if (target) setSalesModalTarget(target);
          else setSalesModalTarget(undefined);
      }
      setIsSalesModalOpen(true);
  };

  const closeSalesModal = () => {
      setIsSalesModalOpen(false);
      setSalesModalTarget(undefined);
  };

  const computeDealMRR = (target: SalesTarget, phase: Phase, pmfScore: number, employees: Employee[]) => {
      const profile = getDealProfile(target, phase);
      if (!profile) return 0;
      if (pmfScore < profile.minPMF) return 0;
      if (profile.requiresSales && !employees.some(e => e.role === Role.SALES)) return 0;
      return profile.mrr;
  };

  const completeSalesPitch = (
    target: SalesTarget,
    win: boolean,
    sideEffects: { techDebt: number; sanityCost: number; cashCost: number },
    metadata?: { successChance?: number; majorEventId?: string; customLabel?: string; isMajorEvent?: boolean }
  ) => {
      setIsSalesModalOpen(false);
      setSalesModalTarget(undefined);
      
      setGameState(prev => {
          let mrrGain = 0;
          if (win && !metadata?.isMajorEvent) {
              mrrGain = computeDealMRR(target, prev.phase, prev.pmf_score, prev.employees);
          }

          const label = metadata?.customLabel || target;
          const chanceText = metadata?.successChance !== undefined ? ` (成功率 ${(metadata.successChance * 100).toFixed(1)}%)` : '';
          const logMsg = win
            ? `商談成立(${label}): MRR +¥${mrrGain.toLocaleString()}${chanceText}`
            : `商談失敗(${label})...${chanceText}`;
          const logType = win ? 'SUCCESS' : 'WARNING';

          let nextState = withMachineModeCheck({
              ...prev,
              kpi: { ...prev.kpi, MRR: prev.kpi.MRR + mrrGain },
              tech_debt: prev.tech_debt + sideEffects.techDebt,
              cash: prev.cash - sideEffects.cashCost,
              sanity: Math.max(0, prev.sanity - sideEffects.sanityCost),
              logs: [...prev.logs, createLogEntry(prev, logMsg, logType)]
          });

          if (metadata?.majorEventId && prev.active_major_event && prev.active_major_event.id === metadata.majorEventId) {
              nextState = applyMajorEventOutcome(prev.active_major_event, win, nextState);
              nextState = { ...nextState, active_major_event: null };
          }

          return nextState;
      });
      if (win) playSound('success');
      else playSound('error');
  };

  const handlePrivateAction = (type: 'WORK' | 'FAMILY') => {
      if (gameState.is_machine_mode && type === 'FAMILY') return;
      setGameState(prev => {
          const msg = type === 'WORK' ? '休日返上で働いた。' : '家族と過ごした。';
           if (type === 'WORK') {
               return withMachineModeCheck({ 
                   ...prev, 
                   sanity: Math.max(0, prev.sanity - 10), 
                   leads: prev.leads + 5,
                   philosophy: { ...prev.philosophy, loneliness: prev.philosophy.loneliness + 2 },
                  logs: [...prev.logs, createLogEntry(prev, msg)]
               });
           } else {
               return { 
                   ...prev, 
                   sanity: Math.min(100, prev.sanity + 20),
                   family_relationship: Math.min(100, prev.family_relationship + 15),
                   philosophy: { ...prev.philosophy, loneliness: Math.max(0, prev.philosophy.loneliness - 5) },
                  logs: [...prev.logs, createLogEntry(prev, msg)]
                };
           }
      });
  };

  // Helpers
  const getUITheme = () => {
    if (gameState.investor_type === InvestorType.BLITZ) {
        return { bg: 'bg-[#1a0e14]', text: 'text-[#ff8a9a]', border: 'border-[#ff5c8d]/70', accent: 'bg-[#ff5c8d]', font: 'font-sans' };
    }
    if (gameState.investor_type === InvestorType.PRODUCT) {
        return { bg: 'bg-[#0b1229]', text: 'text-[#8bd3ff]', border: 'border-[#3b82f6]/60', accent: 'bg-[#3b82f6]', font: 'font-mono' };
    }
    if (gameState.investor_type === InvestorType.FAMILY) {
        return { bg: 'bg-[#16100c]', text: 'text-[#f2c17d]', border: 'border-[#f59e0b]/60', accent: 'bg-[#f59e0b]', font: 'font-serif' };
    }
    // SEED / DEFAULT (Retro Terminal)
    return { bg: 'bg-[#0b1224]', text: 'text-slate-100', border: 'border-indigo-700/50', accent: 'bg-cyan-500', font: 'font-sans' };
  };

  const canUseCommand = (command: 'SALES' | 'FIRE' | 'PIVOT' | 'RECRUIT' | 'SIDE_GIG'): boolean => {
    if (command === 'RECRUIT' && !gameState.flags.is_recruit_unlocked) return false;
    if (command === 'SIDE_GIG' && !gameState.flags.is_side_gig_unlocked) return false;
    if (gameState.investor_type === InvestorType.PRODUCT && command === 'SALES') return false;
    if (gameState.investor_type === InvestorType.FAMILY && command === 'FIRE') return false;
    return true;
  };

  // Org chart helper
  const wouldCreateCycle = (employeeId: string, newManagerId: string | null, employees: Employee[]) => {
      let cursor = newManagerId;
      while (cursor) {
          if (cursor === employeeId) return true;
          const next = employees.find(e => e.id === cursor);
          cursor = next?.manager_id ?? null;
      }
      return false;
  };

  const assignManager = (employeeId: string, managerId: string | null) => {
      if (employeeId === managerId) return;
      setGameState(prev => {
          const target = prev.employees.find(e => e.id === employeeId);
          if (!target) return prev;
          if (wouldCreateCycle(employeeId, managerId, prev.employees)) return prev;

          const manager = managerId ? prev.employees.find(e => e.id === managerId) : null;
          const updated = {
              ...prev,
              employees: prev.employees.map(e => e.id === employeeId ? { ...e, manager_id: managerId } : e)
          };
          const logMsg = manager ? `${target.name} の上司を ${manager.name} に設定` : `${target.name} を CEO 直下に配置`;
          return { ...updated, logs: appendLog(updated, logMsg, 'INFO') };
      });
  };

  // Other helpers
  const adjustMarketingBudget = (v: number) => setGameState(p => ({...p, marketing_budget: Math.max(0, p.marketing_budget + v)}));
  const setPricingStrategy = (s: PricingStrategy) => setGameState(p => ({...p, pricing_strategy: s}));
  const clickGoldenLead = () => setTurnBonuses(p => ({...p, goldenLeadHit: true}));
  const resolveIncident = () => setTurnBonuses(p => ({...p, incidentsResolved: p.incidentsResolved + 1}));
  const chooseCoFounder = (type: CoFounderType) => setGameState(p => ({...p, co_founder: { name: type === 'HACKER' ? 'Ken' : 'Takashi', type, relationship: 100 }}));
  const applyForSubsidy = () => setGameState(p => ({...p, cash: p.cash + 2000000, flags: {...p.flags, has_received_subsidy: true}}));
  const openSocialPost = (id: string) => { const p = socialPostsCache.find(x => x.id === id); if(p) setGameState(s => ({...s, active_social_post: p})); };
  const closeSocialPost = () => setGameState(s => ({...s, active_social_post: null}));
  const replyToSocialPost = () => closeSocialPost(); // Simplified

  return (
    <GameContext.Provider value={{ 
        gameState, monthlyBurn, nextTurn, hireEmployee, fireEmployee, adjustMarketingBudget, 
        startSalesPitch, completeSalesPitch, handlePrivateAction,
        clickGoldenLead, resolveIncident, chooseCoFounder, doCustomerInterview, 
        doClientWork, applyForSubsidy, resolveEvent,
        isSalesModalOpen, closeSalesModal, salesModalTarget,
        getUITheme, canUseCommand, setPricingStrategy, floatingTexts,
        assignManager,
        openSocialPost, closeSocialPost, replyToSocialPost,
        unreadCount, markAllAsRead, playSound,
        activeMajorEvent: gameState.active_major_event
        , lang, setLanguage
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) throw new Error('useGame error');
  return context;
};


import { useGame } from '../context/GameContext';
import { Role, Phase, CoFounderType, InvestorType, PricingStrategy } from '../types';
import { Briefcase, UserPlus, Zap, ShieldAlert, MessageCircle, Landmark, Coffee, Lock, Trash2, BarChart3, Crown, Target, Network, Clock, Terminal, ArrowRight, TrendingUp, DollarSign, Users, Activity } from 'lucide-react';
import { SalesMinigame } from './SalesMinigame';
import { NarrativeModal } from './NarrativeModal';
import { EndingScreen } from './EndingScreen';
import { HeavyButton } from './HeavyButton';
import { SocialFeedModal } from './SocialFeedModal'; 
import { useState, useEffect, useRef } from 'react';
import { OrgChart } from './OrgChart';
import { Smartphone } from './Smartphone';
import { NotificationToast } from './NotificationToast';

export const Dashboard = () => {
  const { 
      gameState, hireEmployee, fireEmployee, adjustMarketingBudget, startSalesPitch, 
      handlePrivateAction, nextTurn, isSalesModalOpen, closeSalesModal, completeSalesPitch,
      chooseCoFounder, doCustomerInterview, applyForSubsidy, doClientWork, resolveEvent,
      getUITheme, canUseCommand, setPricingStrategy, salesModalTarget, floatingTexts, monthlyBurn,
      lang, setLanguage
  } = useGame();

  const [isOrgChartOpen, setIsOrgChartOpen] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const theme = getUITheme();
  const { is_decision_mode, is_machine_mode, is_game_over } = gameState;

  // Auto-scroll logs
  useEffect(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.logs]);

  const t = (key: string, fallback: string) => {
      const ja: Record<string, string> = {
          actions: 'アクション',
          interview: '顧客インタビュー',
          sideGig: '副業受託',
          salesPitch: '営業カード',
          cashReserves: '手元資金',
          monthlyRevenue: '月次売上',
          sanity: 'SANITY (メンタル)',
          team: 'チーム',
          orgChart: '組織図',
          recruitLabel: '採用（初期費用 ¥30万）',
          lock: 'ロック',
          founderSelectTitle: '共同創業者を選んでください',
          founderSelectDesc: '2020年4月、東京は静まり返っている。誰と走るかで会社のリズムは変わる。',
          hackerTitle: 'KEN（ハッカー）',
          hackerDesc: '「コードで切り拓く。君は売ってこい。」',
          hackerPerk: '効果: 開発スピード 1.5倍',
          hustlerTitle: 'TAKASHI（ハスラー）',
          hustlerDesc: '「口説くのは任せろ。数字を積もう。」',
          hustlerPerk: '効果: 営業処理能力 1.5倍'
      };
      const en: Record<string, string> = {
          actions: 'Actions',
          interview: 'Customer Interview',
          sideGig: 'Side Gig',
          salesPitch: 'Sales Cards',
          cashReserves: 'Cash Reserves',
          monthlyRevenue: 'Monthly Revenue',
          sanity: 'SANITY (Mental Health)',
          team: 'Team',
          orgChart: 'Org Chart',
          recruitLabel: 'Recruit (¥300k upfront)',
          lock: 'LOCK',
          founderSelectTitle: 'Choose your co-founder',
          founderSelectDesc: 'April 2020. Tokyo is silent. Your partner will shape the rhythm of this company.',
          hackerTitle: 'KEN [Hacker]',
          hackerDesc: '"I build, you sell."',
          hackerPerk: 'Perk: Dev speed x1.5',
          hustlerTitle: 'TAKASHI [Hustler]',
          hustlerDesc: '"I can sell ice to Eskimos."',
          hustlerPerk: 'Perk: Sales capacity x1.5'
      };
      const dict = lang === 'ja' ? ja : en;
      return dict[key] || fallback;
  };

  if (is_game_over) return <EndingScreen state={gameState} />;

  // Co-founder Selection Modal (Seed Start)
  if (!gameState.co_founder) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 font-sans bg-gradient-to-br from-slate-950 via-slate-900 to-black">
            <div className="max-w-3xl w-full bg-black/70 border border-cyan-500/40 rounded-2xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h1 className="text-3xl font-black text-cyan-200 tracking-tight">{t('founderSelectTitle','Choose your co-founder')}</h1>
                    <p className="text-sm text-slate-400 leading-relaxed mt-2">{t('founderSelectDesc','April 2020. Tokyo is silent. Your partner will shape the rhythm of this company.')}</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                      <button onClick={() => setLanguage('ja')} className={`px-3 py-1 rounded border ${lang === 'ja' ? 'border-cyan-400 text-cyan-200' : 'border-slate-700 text-slate-500'}`}>日本語</button>
                      <button onClick={() => setLanguage('en')} className={`px-3 py-1 rounded border ${lang === 'en' ? 'border-cyan-400 text-cyan-200' : 'border-slate-700 text-slate-500'}`}>English</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button onClick={() => chooseCoFounder(CoFounderType.HACKER)} className="border border-slate-700 bg-slate-900/60 hover:border-cyan-400 hover:-translate-y-1 transition-all rounded-xl p-6 text-left">
                        <div className="text-lg font-bold text-cyan-200">{t('hackerTitle','KEN')}</div>
                        <div className="text-xs text-slate-400 mt-2">{t('hackerDesc','"I build, you sell."')}</div>
                        <div className="mt-4 text-xs text-cyan-300">{t('hackerPerk','Perk: Dev speed x1.5')}</div>
                    </button>
                    <button onClick={() => chooseCoFounder(CoFounderType.HUSTLER)} className="border border-slate-700 bg-slate-900/60 hover:border-amber-400 hover:-translate-y-1 transition-all rounded-xl p-6 text-left">
                        <div className="text-lg font-bold text-amber-200">{t('hustlerTitle','TAKASHI')}</div>
                        <div className="text-xs text-slate-400 mt-2">{t('hustlerDesc','"I can sell ice to Eskimos."')}</div>
                        <div className="mt-4 text-xs text-amber-300">{t('hustlerPerk','Perk: Sales capacity x1.5')}</div>
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className={`flex w-full h-screen overflow-hidden ${theme.bg} ${theme.text} ${theme.font} transition-colors duration-1000`}>
      
      {/* Visual Effects */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {floatingTexts.map(ft => (
              <div key={ft.id} className={`absolute animate-float-up ${ft.color}`} style={{ left: `${ft.x}%`, top: `${ft.y}%` }}>{ft.text}</div>
          ))}
      </div>
      <NotificationToast />
      <Smartphone />
      {is_decision_mode && <div className="pointer-events-none fixed inset-0 z-10 bg-[radial-gradient(circle,transparent_50%,black_100%)] animate-pulse"></div>}
      
      {/* Modals */}
      {isSalesModalOpen && <SalesMinigame onClose={closeSalesModal} onComplete={completeSalesPitch} employees={gameState.employees} coFounder={gameState.co_founder} sanity={gameState.sanity} cash={gameState.cash} directTarget={salesModalTarget} phase={gameState.phase} pmfScore={gameState.pmf_score} techDebt={gameState.tech_debt} difficultyModifier={gameState.difficulty_modifier} majorEvent={gameState.active_major_event} seedMissionsLeft={gameState.seedInitialSalesMissionsLeft} />}
      {gameState.active_event && <NarrativeModal event={gameState.active_event} onResolve={resolveEvent} />}
      {isOrgChartOpen && <OrgChart onClose={() => setIsOrgChartOpen(false)} />}
      {gameState.active_social_post && <SocialFeedModal />}

      {/* === LEFT PANEL: NARRATIVE TIMELINE (60%) === */}
      <div className={`w-[60%] h-full flex flex-col border-r ${theme.border} relative`}>
          {/* Header */}
          <div className={`p-6 border-b ${theme.border} bg-black/20 backdrop-blur-md z-10`}>
              <h1 className="text-4xl font-black tracking-tighter uppercase">Burn Rate Tokyo</h1>
              <div className="flex items-center gap-4 mt-2 text-sm opacity-70">
                  <span className="flex items-center gap-1"><Clock size={14}/> Week {gameState.week}</span>
                  <span className="flex items-center gap-1"><Terminal size={14}/> {gameState.phase}</span>
                  <span className="flex items-center gap-1"><Activity size={14}/> {gameState.investor_type} OS</span>
              </div>
          </div>

          {/* Timeline Log */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar scroll-smooth">
              {gameState.logs.map((log) => (
                  <div key={log.id} className={`relative pl-6 border-l-2 ${log.type === 'CRITICAL' ? 'border-red-500' : log.type === 'SUCCESS' ? 'border-emerald-500' : 'border-slate-700'} animate-in slide-in-from-left-4 fade-in duration-500`}>
                      <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${log.type === 'CRITICAL' ? 'bg-red-500' : log.type === 'SUCCESS' ? 'bg-emerald-500' : 'bg-slate-700'}`}></div>
                      <div className="text-xs opacity-50 mb-1 font-mono">Week {log.week}</div>
                      <div className={`text-lg leading-relaxed ${log.type === 'CRITICAL' ? 'text-red-400 font-bold' : log.type === 'SUCCESS' ? 'text-emerald-400' : 'opacity-90'}`}>
                          {log.message}
                      </div>
                  </div>
              ))}
              <div ref={logEndRef} className="h-20"></div>
          </div>

          {/* Bottom Fade */}
          <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-${theme.bg.replace('bg-', '')} to-transparent pointer-events-none`}></div>
      </div>

      {/* === RIGHT PANEL: COMMAND CENTER (40%) === */}
      <div className="w-[40%] h-full flex flex-col bg-black/10 relative">
          
          {/* Status Deck */}
          <div className={`p-6 border-b ${theme.border}`}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-black/20 border border-white/5 rounded">
                      <div className="text-xs opacity-50 uppercase mb-1">Cash Reserves</div>
                      <div className={`text-3xl font-mono font-bold ${gameState.cash < monthlyBurn * 2 ? 'text-red-500 animate-pulse' : ''}`}>
                          ¥{(gameState.cash/10000).toFixed(0)}<span className="text-sm">万</span>
                      </div>
                      <div className="text-xs opacity-50 mt-1 flex justify-between">
                          <span>Burn: -¥{(monthlyBurn/10000).toFixed(0)}万/mo</span>
                          <span>Runway: {gameState.runway_months.toFixed(1)}mo</span>
                      </div>
                  </div>
                  <div className="p-4 bg-black/20 border border-white/5 rounded">
                      <div className="text-xs opacity-50 uppercase mb-1">Monthly Revenue</div>
                      <div className="text-3xl font-mono font-bold">
                          ¥{(gameState.kpi.MRR/10000).toFixed(0)}<span className="text-sm">万</span>
                      </div>
                      <div className="text-xs opacity-50 mt-1 flex justify-between">
                          <span>PMF Score: {gameState.pmf_score}</span>
                          <span>Growth: {(gameState.kpi.growth_rate_mom*100).toFixed(1)}%</span>
                      </div>
                  </div>
                  <div className="p-4 bg-black/20 border border-white/5 rounded col-span-2">
                      <div className="text-xs opacity-50 uppercase mb-1">Action Points</div>
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-mono font-bold">
                          {gameState.actionPoints}/{gameState.maxActionPoints}
                        </div>
                        {gameState.actionPoints <= 0 && (
                          <span className="text-xs text-red-400">今週の行動ポイントはありません</span>
                        )}
                      </div>
                  </div>
              </div>

              {/* Sanity Bar */}
              <div className="mb-2">
                  <div className="flex justify-between text-xs opacity-70 mb-1">
                      <span>SANITY (Mental Health)</span>
                      <span>{gameState.sanity}%</span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${gameState.sanity < 30 ? 'bg-red-600' : 'bg-blue-500'}`} style={{ width: `${gameState.sanity}%` }}></div>
                  </div>
              </div>
          </div>

          {/* Command Grid */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <h3 className="text-xs font-bold opacity-70 mb-4 tracking-widest text-slate-300">アクション</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* 1. CUSTOMER INTERVIEW (Always Open) */}
                  <button onClick={doCustomerInterview} className={`p-4 border ${theme.border} hover:bg-white/5 transition-all text-left group`}>
                      <div className="flex items-center gap-2 mb-2">
                          <MessageCircle size={16} className="text-emerald-400"/>
                          <span className="font-bold text-sm">顧客インタビュー</span>
                      </div>
                      <div className="text-xs opacity-50 group-hover:opacity-100">Gain PMF. Cost: ¥5万</div>
                  </button>

                  {/* 2. SIDE GIG (Unlock W3) */}
                  {canUseCommand('SIDE_GIG') ? (
                      <button onClick={doClientWork} className={`p-4 border ${theme.border} hover:bg-white/5 transition-all text-left group`}>
                          <div className="flex items-center gap-2 mb-2">
                              <Coffee size={16} className="text-yellow-400"/>
                              <span className="font-bold text-sm">副業受託</span>
                          </div>
                          <div className="text-xs opacity-50 group-hover:opacity-100">Cash +¥60万. Tech Debt +5.</div>
                      </button>
                  ) : (
                      <div className="p-4 border border-white/5 opacity-30 flex items-center justify-center"><Lock size={16}/></div>
                  )}

                  {/* 3. RECRUIT (Unlock W6) */}
                  {canUseCommand('RECRUIT') ? (
                      <div className="grid grid-cols-1 gap-2">
                        <div className="text-[10px] text-slate-400">採用（初期費用 ¥30万）</div>
                        <div className="grid grid-cols-3 gap-2">
                          <button onClick={() => hireEmployee(Role.ENGINEER)} className={`p-3 border ${theme.border} hover:bg-white/5 transition-all text-left text-xs`}>
                              エンジニア
                          </button>
                          <button onClick={() => hireEmployee(Role.SALES)} className={`p-3 border ${theme.border} hover:bg-white/5 transition-all text-left text-xs`}>
                              営業
                          </button>
                          <button onClick={() => hireEmployee(Role.CS)} className={`p-3 border ${theme.border} hover:bg-white/5 transition-all text-left text-xs`}>
                              CS
                          </button>
                        </div>
                      </div>
                  ) : (
                      <div className="p-4 border border-white/5 opacity-30 flex items-center justify-center"><Lock size={16}/></div>
                  )}

                  {/* 4. SALES (Locked until Product) */}
                  {canUseCommand('SALES') ? (
                      <button onClick={() => startSalesPitch()} className={`p-4 border ${theme.border} hover:bg-white/5 transition-all text-left group`}>
                          <div className="flex items-center gap-2 mb-2">
                              <Briefcase size={16} className="text-indigo-400"/>
                              <span className="font-bold text-sm">営業カード</span>
                          </div>
                          <div className="text-xs opacity-50 group-hover:opacity-100">MRR獲得。SAN消耗リスク。</div>
                      </button>
                  ) : (
                      <div className="p-4 border border-white/5 opacity-30 flex items-center justify-center"><Lock size={16}/></div>
                  )}
              </div>

              {/* Organization List */}
              <div className={`border-t ${theme.border} pt-6`}>
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-bold opacity-50 uppercase tracking-widest">TEAM ({gameState.employees.length})</h3>
                      <button onClick={() => setIsOrgChartOpen(true)} className="text-xs opacity-50 hover:opacity-100 flex items-center gap-1"><Network size={12}/> Org Chart</button>
                  </div>
                  <div className="space-y-2">
                      {gameState.employees.length === 0 ? <div className="text-xs opacity-30 italic">Just you and your co-founder.</div> : gameState.employees.map(emp => (
                          <div key={emp.id} className="flex justify-between items-center bg-white/5 p-2 rounded text-xs">
                              <div className="font-bold">{emp.role}</div>
                              <div className="opacity-50">¥{(emp.salary/10000).toFixed(0)}万</div>
                              {canUseCommand('FIRE') && <button onClick={() => fireEmployee(emp.id)} className="text-red-500 hover:bg-red-900/30 p-1 rounded"><Trash2 size={12}/></button>}
                          </div>
                      ))}
                  </div>
              </div>
              
              {/* Turn Button */}
              <div className="mt-8">
                   {is_decision_mode ? (
                       <HeavyButton onClick={nextTurn} label="MAKE DECISION" className="w-full py-4 bg-red-600 text-white font-bold rounded shadow-[0_0_20px_rgba(220,38,38,0.5)] animate-pulse" />
                   ) : (
                       <button onClick={nextTurn} className={`w-full py-4 font-bold text-black ${theme.accent.replace('bg-', 'hover:bg-').replace('700', '400').replace('600', '400')} bg-white transition-all shadow-lg hover:scale-[1.02]`}>
                           NEXT WEEK ➜
                       </button>
                   )}
              </div>
          </div>
      </div>

    </div>
  );
};

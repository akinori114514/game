
import React, { useState, useEffect, useMemo } from 'react';
import { X, Zap, Briefcase, Building2, Rocket, Users, DollarSign, HeartCrack, Database, Crown, Lock } from 'lucide-react';
import { SalesTarget, SalesCard, Employee, Role, CoFounderType, CoFounder, Phase } from '../types';
import { getDealProfile, getDealGateMessage } from '../services/dealProfiles';

interface Props {
  onClose: () => void;
  onComplete: (target: SalesTarget, win: boolean, sideEffects: { techDebt: number, sanityCost: number, cashCost: number }) => void;
  employees: Employee[];
  coFounder: CoFounder | null;
  sanity: number;
  cash: number;
  directTarget?: SalesTarget;
  phase: Phase;
  pmfScore: number;
}

export const SalesMinigame: React.FC<Props> = ({ onClose, onComplete, employees, coFounder, sanity, cash, directTarget, phase, pmfScore }) => {
  const [step, setStep] = useState<'SELECT' | 'BATTLE'>('SELECT');
  const [selectedTarget, setSelectedTarget] = useState<SalesTarget | null>(null);
  const [clientResistance, setClientResistance] = useState(100);
  const [maxResistance, setMaxResistance] = useState(100);
  const [moves, setMoves] = useState(3);
  const [log, setLog] = useState<string[]>([]);
  const [activeDealMRR, setActiveDealMRR] = useState<number>(0);
  
  // Battle State to track accumulated penalties
  const [accumulatedDebt, setAccumulatedDebt] = useState(0);
  const [accumulatedSanityCost, setAccumulatedSanityCost] = useState(0);
  const [accumulatedCashCost, setAccumulatedCashCost] = useState(0);

  const hasSales = employees.some(e => e.role === Role.SALES);

  useEffect(() => {
      if (directTarget) {
          startBattle(directTarget);
      }
  }, [directTarget]);

  // Generate Deck based on Team
  const deck = useMemo(() => {
      const cards: SalesCard[] = [];
      
      // Base Cards (Founder)
      cards.push({ id: 'base_1', name: "熱意", cost: 1, damage: 20, desc: "想いを伝える" });
      cards.push({ id: 'base_2', name: "土下座", cost: 1, damage: 40, desc: "プライドを捨てる", costType: 'SANITY', costAmount: 10 });

      // Co-Founder Cards
      if (coFounder?.type === CoFounderType.HUSTLER) {
          cards.push({ id: 'co_1', name: "ゴリ押し", cost: 1, damage: 35, desc: "NOと言わせない" });
      } else if (coFounder?.type === CoFounderType.HACKER) {
          cards.push({ id: 'co_2', name: "プロトタイプ", cost: 1, damage: 30, desc: "動くものを見せる" });
      }

      // Employee Cards
      const hasSalesMember = employees.some(e => e.role === Role.SALES);
      const hasEngineer = employees.some(e => e.role === Role.ENGINEER);
      const hasCS = employees.some(e => e.role === Role.CS);

      if (hasSalesMember) {
          cards.push({ id: 'sales_1', name: "接待", cost: 1, damage: 50, desc: "高級焼肉で落とす", costType: 'CASH', costAmount: 50000 });
          cards.push({ id: 'sales_2', name: "過剰な約束", cost: 1, damage: 80, desc: "「来月実装します！」", riskType: 'TECH_DEBT', riskAmount: 10 });
      }

      if (hasEngineer) {
          cards.push({ id: 'eng_1', name: "ハリボテ", cost: 1, damage: 60, desc: "見た目だけのモック", riskType: 'TECH_DEBT', riskAmount: 5 });
      }

      if (hasCS) {
           cards.push({ id: 'cs_1', name: "安心感", cost: 2, damage: 40, desc: "サポート体制をアピール" });
      }

      // Fill remaining with generic if low
      if (cards.length < 4) {
          cards.push({ id: 'gen_1', name: "値引き", cost: 1, damage: 15, desc: "利益を削る" });
      }

      return cards;
  }, [employees, coFounder]);

  const startBattle = (target: SalesTarget) => {
      const gate = getDealGateMessage({ target, phase, pmfScore, hasSales });
      const profile = getDealProfile(target, phase);
      if (!profile) {
          setLog([`このフェーズでは ${target} の商談は解禁されていません。`]);
          return;
      }
      if (gate) {
          setLog([gate]);
          return;
      }

      setSelectedTarget(target);
      setActiveDealMRR(profile.mrr);
      setClientResistance(profile.resistance);
      setMaxResistance(profile.resistance);
      setMoves(profile.moves);
      setLog([`商談開始。相手: ${profile.label} / 期待MRR ¥${profile.mrr.toLocaleString()}`]);
      setStep('BATTLE');
      
      setAccumulatedDebt(0);
      setAccumulatedSanityCost(0);
      setAccumulatedCashCost(0);
  };

  const playCard = (card: SalesCard) => {
    if (moves < card.cost) return;

    // Check Resource Constraints
    if (card.costType === 'CASH' && card.costAmount && cash < card.costAmount) {
        setLog(prev => [`資金不足！ ¥${card.costAmount}必要です。`, ...prev]);
        return;
    }
    if (card.costType === 'SANITY' && card.costAmount && sanity < card.costAmount) {
        setLog(prev => [`精神的限界！これ以上できません。`, ...prev]);
        return;
    }

    // Apply Costs & Risks
    if (card.costType === 'CASH') setAccumulatedCashCost(p => p + (card.costAmount || 0));
    if (card.costType === 'SANITY') setAccumulatedSanityCost(p => p + (card.costAmount || 0));
    if (card.riskType === 'TECH_DEBT') setAccumulatedDebt(p => p + (card.riskAmount || 0));

    const newResistance = Math.max(0, clientResistance - card.damage);
    setClientResistance(newResistance);
    setMoves(m => m - card.cost);
    setLog(prev => [`「${card.name}」を使用。抵抗値 -${card.damage}`, ...prev]);

    if (newResistance === 0) {
      setTimeout(() => onComplete(selectedTarget!, true, {
          techDebt: accumulatedDebt + (card.riskAmount || 0),
          sanityCost: accumulatedSanityCost + (card.costType === 'SANITY' ? (card.costAmount||0) : 0),
          cashCost: accumulatedCashCost + (card.costType === 'CASH' ? (card.costAmount||0) : 0)
      }), 1000);
    } else if (moves - card.cost <= 0) {
      setTimeout(() => onComplete(selectedTarget!, false, {
          techDebt: accumulatedDebt + (card.riskAmount || 0),
          sanityCost: accumulatedSanityCost + (card.costType === 'SANITY' ? (card.costAmount||0) : 0) + 10, // Lose Penalty
          cashCost: accumulatedCashCost + (card.costType === 'CASH' ? (card.costAmount||0) : 0)
      }), 1000);
    }
  };

  const targetLabel = selectedTarget === 'FRIENDS' ? '友人・知人' : selectedTarget === 'STARTUP' ? 'スタートアップ' : selectedTarget === 'ENTERPRISE' ? '大手企業' : '超巨大コングロマリット';

  const gateStatus = (target: SalesTarget) => {
      const msg = getDealGateMessage({ target, phase, pmfScore, hasSales });
      return { disabled: !!msg, reason: msg };
  };

  if (step === 'SELECT') {
      return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-indigo-700/40 rounded-2xl w-full max-w-5xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-cyan-200">営業先を選定してください</h2>
                      <p className="text-xs text-slate-400 mt-1">フェーズ/PMF/営業人員で解禁。上位案件ほど抵抗値は高いが単価が伸びます。</p>
                    </div>
                    <button onClick={onClose}><X className="text-slate-400" /></button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Friends Option */}
                    <button 
                        onClick={() => startBattle('FRIENDS')}
                        className="group relative border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-400 rounded-xl p-4 transition-all text-left"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Users className="w-8 h-8 text-blue-400" />
                            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-2 py-1 rounded">難易度: E</span>
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">友人・知人</h3>
                        <p className="text-xs text-slate-400 mb-3 min-h-[3em]">
                            「応援購入」枠。安くてもいいから実績が欲しい。身内なので甘い。
                        </p>
                        <div className="text-xs font-mono text-blue-400 bg-blue-900/20 p-2 rounded">
                            MRR: フェーズに応じてスケール<br/>
                            Risk: なし
                        </div>
                    </button>

                    {/* Startup Option */}
                    {(() => {
                        const gate = gateStatus('STARTUP');
                        return (
                          <button 
                              onClick={() => startBattle('STARTUP')}
                              disabled={gate.disabled}
                              className={`group relative border border-slate-700 bg-slate-800/50 rounded-xl p-4 transition-all text-left ${gate.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 hover:border-emerald-500'}`}
                          >
                              <div className="flex items-center justify-between mb-3">
                                  <Rocket className="w-8 h-8 text-emerald-400" />
                                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-1 rounded">難易度: C</span>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-1">スタートアップ</h3>
                              <p className="text-xs text-slate-400 mb-3 min-h-[3em]">
                                  決裁が早い。「面白そう」だけで買ってくれるが、予算はシビア。
                              </p>
                              <div className="text-xs font-mono text-emerald-400 bg-emerald-900/20 p-2 rounded">
                                  {gate.disabled ? `LOCK: ${gate.reason}` : 'MRR: フェーズに応じてスケール'}
                              </div>
                          </button>
                        );
                    })()}

                    {/* Enterprise Option */}
                    {(() => {
                        const gate = gateStatus('ENTERPRISE');
                        return (
                          <button 
                              onClick={() => startBattle('ENTERPRISE')}
                              disabled={gate.disabled}
                              className={`group relative border border-slate-700 bg-slate-800/50 rounded-xl p-4 transition-all text-left ${gate.disabled ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-800 hover:border-indigo-500'}`}
                          >
                              <div className="flex items-center justify-between mb-3">
                                  <Building2 className="w-8 h-8 text-indigo-400" />
                                  <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-1 rounded">難易度: S</span>
                              </div>
                              <h3 className="text-lg font-bold text-white mb-1">大手上場企業</h3>
                              <p className="text-xs text-slate-400 mb-3 min-h-[3em]">
                                  PMFと営業チームが揃えば挑戦可。
                              </p>
                              <div className="text-xs font-mono text-indigo-400 bg-indigo-900/20 p-2 rounded">
                                  {gate.disabled ? `LOCK: ${gate.reason}` : 'MRR: 高単価 / 失注時SAN値大きめ'}
                              </div>
                              {gate.disabled && (
                                  <div className="mt-2 text-[10px] text-indigo-200 flex items-center gap-1">
                                      <Lock size={12}/> {gate.reason}
                                  </div>
                              )}
                          </button>
                        );
                    })()}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border border-indigo-700/40 rounded-2xl w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800/60 p-4 flex justify-between items-center border-b border-indigo-700/40">
          <h3 className={`text-lg font-bold flex items-center ${selectedTarget === 'WHALE' ? 'text-yellow-300' : 'text-cyan-200'}`}>
            {selectedTarget === 'WHALE' ? <Crown className="w-5 h-5 mr-2 text-yellow-300 animate-pulse" /> : <Briefcase className="w-5 h-5 mr-2 text-cyan-300" />}
            商談中: {targetLabel} {activeDealMRR > 0 && <span className="text-xs text-slate-400 ml-2">MRR ¥{activeDealMRR.toLocaleString()}</span>}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Battle Area */}
        <div className="p-8 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-slate-950/80 to-slate-900">
          
          {/* Client Status */}
          <div className="w-full max-w-md text-center">
            <div className="flex justify-between text-sm text-slate-400 mb-2">
              <span>顧客の抵抗値</span>
              <span>{clientResistance}/{maxResistance}</span>
            </div>
            <div className="h-4 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
              <div 
                className="h-full bg-gradient-to-r from-indigo-400 to-cyan-300 transition-all duration-500" 
                style={{ width: `${(clientResistance / maxResistance) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Action Feedback */}
          <div className="h-16 flex items-center justify-center text-indigo-300 text-sm font-mono text-center px-4">
            {log[0]}
          </div>

          {/* Cards Hand */}
          <div className="grid grid-cols-4 gap-3 w-full">
            {deck.map((card) => (
              <button
                key={card.id}
                onClick={() => playCard(card)}
                disabled={moves < card.cost || (card.costType === 'CASH' && cash < (card.costAmount||0)) || (card.costType === 'SANITY' && sanity < (card.costAmount||0))}
                className={`
                  relative group flex flex-col items-center p-3 rounded-lg border transition-all h-36
                  ${moves >= card.cost 
                    ? 'bg-slate-800 border-slate-600 hover:border-indigo-500 hover:-translate-y-1 shadow-lg' 
                    : 'bg-slate-800/30 border-slate-800 opacity-50 cursor-not-allowed'}
                `}
              >
                <div className="absolute top-1 right-1 bg-slate-950 rounded w-5 h-5 flex items-center justify-center text-[10px] font-bold border border-slate-700 text-slate-300">
                  {card.cost}
                </div>
                
                <div className="mt-2">
                    {card.costType === 'CASH' ? <DollarSign className="w-6 h-6 text-yellow-500" /> :
                     card.costType === 'SANITY' ? <HeartCrack className="w-6 h-6 text-red-500" /> :
                     card.riskType === 'TECH_DEBT' ? <Database className="w-6 h-6 text-purple-500" /> :
                     <Zap className="w-6 h-6 text-indigo-400" />}
                </div>

                <div className="text-xs font-bold text-slate-200 mt-2 text-center leading-tight">{card.name}</div>
                <div className="text-[10px] text-slate-500 mt-1 text-center leading-tight">{card.desc}</div>
                
                {/* Cost/Risk Badges */}
                <div className="mt-auto flex flex-col items-center gap-1 w-full">
                    <div className="text-[10px] font-mono text-indigo-300">-{card.damage} 抵抗</div>
                    {card.costAmount && (
                        <div className={`text-[9px] px-1 rounded ${card.costType === 'CASH' ? 'text-yellow-400 bg-yellow-900/30' : 'text-red-400 bg-red-900/30'}`}>
                            -{card.costAmount.toLocaleString()} {card.costType}
                        </div>
                    )}
                    {card.riskAmount && (
                         <div className="text-[9px] px-1 rounded text-purple-400 bg-purple-900/30">
                             +{card.riskAmount} DEBT
                         </div>
                    )}
                </div>
              </button>
            ))}
          </div>

          <div className="text-slate-500 text-sm font-mono">
            残り手数: {moves}
          </div>
        </div>
      </div>
    </div>
  );
};

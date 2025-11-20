
import React from 'react';
import { useGame } from '../context/GameContext';
import { Briefcase, Users, Activity, Settings, DollarSign, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { InvestorType } from '../types';

export const Sidebar = () => {
  const { gameState, monthlyBurn, getUITheme } = useGame();
  const { kpi, employees, sanity, tech_debt, phase, runway_months, cash, investor_type, is_machine_mode } = gameState;

  const netBurn = monthlyBurn - kpi.MRR;
  const isRunwayCritical = runway_months < 3;
  const theme = getUITheme();

  // Dynamic Border Colors based on Theme
  const getBorderColor = () => {
    if (investor_type === InvestorType.BLITZ) return 'border-red-600';
    if (investor_type === InvestorType.PRODUCT) return 'border-blue-500';
    if (investor_type === InvestorType.FAMILY) return 'border-orange-400';
    return 'border-slate-700';
  };

  const getBgColor = () => {
     if (investor_type === InvestorType.BLITZ) return 'bg-red-950/30';
     if (investor_type === InvestorType.PRODUCT) return 'bg-blue-950/30';
     if (investor_type === InvestorType.FAMILY) return 'bg-orange-950/30';
     return 'bg-slate-900';
  };

  return (
    <div className={`w-64 h-screen flex flex-col sticky top-0 border-r transition-colors duration-500 ${getBorderColor()} ${getBgColor()}`}>
      <div className={`p-6 border-b ${getBorderColor()}`}>
        <h1 className="text-xl font-bold text-white tracking-tight">Burn Rate Tokyo</h1>
        <p className="text-xs text-slate-400 mt-1">OS: <span className="font-mono text-white">{investor_type === 'NONE' ? 'BOOTSTRAP' : investor_type}</span></p>
      </div>

      <div className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <nav className="space-y-1 px-3 mb-8">
          <div className="flex items-center px-3 py-2 text-slate-200 bg-slate-800/50 rounded-md">
            <Activity className="w-5 h-5 mr-3" />
            ダッシュボード
          </div>
          <div className="flex items-center px-3 py-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md cursor-pointer">
             <Users className="w-5 h-5 mr-3" />
            チーム ({employees.length})
          </div>
        </nav>

        {/* Key Metrics Sidebar Summary */}
        <div className="px-6 space-y-6">
          
          {/* BLITZ OS Special Metric */}
          {investor_type === InvestorType.BLITZ && (
             <div>
                <label className="text-xs font-bold text-red-500 uppercase animate-pulse">GROWTH RATE (MoM)</label>
                <div className="text-3xl font-mono font-black text-white">
                  {(kpi.growth_rate_mom * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">Target: {'>'}20.0%</div>
             </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">ランウェイ (資金寿命)</label>
            <div className={`text-2xl font-mono font-bold ${isRunwayCritical ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
              {runway_months >= 99 ? '無限' : `${runway_months.toFixed(1)} ヶ月`}
            </div>
            {isRunwayCritical && (
              <div className="flex items-center mt-1 text-xs text-red-400">
                <AlertTriangle className="w-3 h-3 mr-1" />
                倒産寸前
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">月次バーン (支出)</label>
            <div className="text-lg font-mono text-slate-300">
              ¥{(monthlyBurn / 10000).toFixed(0)}万
            </div>
            <div className="text-xs text-slate-500">ネット(純減): ¥{(netBurn / 10000).toFixed(0)}万</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">創業者メンタル (SAN値)</label>
            {is_machine_mode ? (
               <div className="w-full bg-slate-900 border border-red-900 rounded mt-2 p-1 text-center">
                   <span className="text-red-500 text-xs font-bold animate-pulse flex items-center justify-center">
                       <Zap className="w-3 h-3 mr-1" /> MACHINE MODE
                   </span>
               </div>
            ) : (
              <>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${sanity < 30 ? 'bg-red-500' : 'bg-blue-500'}`} 
                    style={{ width: `${sanity}%` }}
                  ></div>
                </div>
                <div className="text-right text-xs text-slate-400 mt-1">{sanity}/100</div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className={`p-4 border-t ${getBorderColor()} bg-black/20`}>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${investor_type === 'BLITZ' ? 'bg-red-600' : investor_type === 'PRODUCT' ? 'bg-blue-600' : investor_type === 'FAMILY' ? 'bg-orange-600' : 'bg-indigo-600'}`}>
            F
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">創業者</p>
            <p className="text-xs text-slate-500">{phase}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

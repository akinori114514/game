import React from 'react';
import { useGame } from '../context/GameContext';
import { ArrowRight, Users, AlertTriangle, Flame, Star } from 'lucide-react';

export const PipelineView = () => {
  const { gameState, clickGoldenLead, resolveIncident } = useGame();
  const { pipeline_metrics: metrics } = gameState;

  if (!metrics) return null;

  const leadsCapacityRatio = metrics.sales_capacity > 0 
    ? (metrics.leads_generated + gameState.leads) / metrics.sales_capacity 
    : 1;

  const csLoadRatio = metrics.cs_capacity > 0
    ? metrics.required_cs / metrics.cs_capacity
    : 1;

  return (
    <div className="w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 overflow-hidden relative">
      <div className="absolute top-0 left-0 bg-slate-800 text-xs text-slate-400 px-2 py-1 rounded-br">
        REVENUE PIPELINE V1.0
      </div>

      <div className="flex items-stretch justify-between gap-4 mt-4">
        
        {/* 1. MARKETING GATE */}
        <div className="flex-1 bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 flex flex-col relative">
          <div className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wider">Marketing Gate</div>
          <div className="flex-1 flex flex-col items-center justify-center">
             <div className="text-2xl font-bold text-white">{metrics.leads_generated}</div>
             <div className="text-xs text-blue-300">新規リード</div>
             <div className="text-xs text-slate-500 mt-1">予算: ¥{(gameState.marketing_budget / 10000).toFixed(0)}万</div>
          </div>
          <ArrowRight className="absolute -right-6 top-1/2 -translate-y-1/2 text-slate-600" />
        </div>

        {/* 2. SALES GATE */}
        <div className="flex-1 bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3 flex flex-col relative">
          <div className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-wider">Sales Gate</div>
          
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>処理能力: {metrics.sales_capacity}件</span>
            {metrics.leads_lost > 0 && <span className="text-red-400 font-bold">-{metrics.leads_lost} 損失</span>}
          </div>

          {/* Visualization of queue */}
          <div className="flex-1 bg-slate-900 rounded border border-slate-700 p-2 relative overflow-hidden">
            <div 
              className={`h-full bg-emerald-600/50 transition-all duration-500 ${leadsCapacityRatio > 1 ? 'bg-red-500/50' : ''}`}
              style={{ width: `${Math.min(100, leadsCapacityRatio * 100)}%` }}
            ></div>
            
            {/* Interactive Golden Lead */}
            {metrics.golden_leads_active && (
                 <button 
                    onClick={clickGoldenLead}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 hover:bg-yellow-300 text-yellow-900 rounded-full p-2 shadow-lg shadow-yellow-400/50 animate-bounce z-10"
                    title="激アツ案件！クリックして成約率UP！"
                 >
                     <Star size={20} fill="currentColor" />
                 </button>
            )}
          </div>

          <div className="text-center mt-2">
             <div className="text-xl font-bold text-white">+{metrics.new_deals}</div>
             <div className="text-xs text-emerald-300">新規契約</div>
          </div>
          <ArrowRight className="absolute -right-6 top-1/2 -translate-y-1/2 text-slate-600" />
        </div>

        {/* 3. CS GATE */}
        <div className="flex-1 bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 flex flex-col">
          <div className="text-xs font-bold text-orange-400 mb-2 uppercase tracking-wider">CS & Retention</div>
          
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>顧客数: {metrics.required_cs}</span>
            <span>担当枠: {metrics.cs_capacity}</span>
          </div>

          {/* Tank Visualization */}
          <div className="flex-1 bg-slate-900 rounded border border-slate-700 p-2 relative">
             {/* Liquid Level */}
             <div className="absolute bottom-0 left-0 right-0 bg-orange-500/30 transition-all duration-500" style={{ height: '60%' }}></div>
             
             {/* Leaks */}
             {csLoadRatio > 1 && (
                 <div className="absolute bottom-2 right-2 text-red-500 animate-pulse flex items-center text-xs font-bold">
                     <AlertTriangle size={12} className="mr-1" /> 解約増
                 </div>
             )}

             {/* Interactive Incident */}
             {metrics.active_incidents > 0 && (
                  <button 
                    onClick={resolveIncident}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-400 text-white rounded-full p-2 shadow-lg animate-pulse"
                    title="炎上中！クリックして消火！"
                  >
                      <Flame size={16} fill="currentColor" />
                  </button>
             )}
          </div>

          <div className="text-center mt-2">
             <div className="text-sm font-bold text-slate-300">維持率: {(100 - (gameState.kpi.churn_rate * 100)).toFixed(1)}%</div>
             <div className="text-xs text-orange-400">MRR: ¥{(gameState.kpi.MRR/10000).toFixed(1)}万</div>
          </div>
        </div>

      </div>
    </div>
  );
};
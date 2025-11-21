import React from 'react';
import { useGame } from '../context/GameContext';
import { PRODUCT_PHASES, determineProductPhase, calculateAverageUnitPrice } from '../services/productLogic';
import { Role } from '../types';

interface Props {
  onClose: () => void;
}

export const ProductModal: React.FC<Props> = ({ onClose }) => {
  const { gameState } = useGame();
  const phaseMeta = determineProductPhase(gameState.pmf_score);
  const quality = gameState.productQuality ?? Math.max(0, 100 - gameState.tech_debt);
  const salesCount = gameState.employees.filter(e => e.role === Role.SALES).length;
  const engCount = gameState.employees.filter(e => e.role === Role.ENGINEER).length;
  const csCount = gameState.employees.filter(e => e.role === Role.CS).length;
  const marketingCount = gameState.employees.filter(e => e.role === Role.MARKETER).length;
  const averageUnitPrice = gameState.averageUnitPrice ?? calculateAverageUnitPrice(gameState);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/60">
          <div>
            <h2 className="text-xl font-bold text-white">プロダクト状況</h2>
            <p className="text-xs text-slate-400">PMF・品質・単価と各職種の影響をまとめて表示します。</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-200">
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-2">
            <div className="text-xs text-slate-400 uppercase">PMF</div>
            <div className="text-2xl font-mono font-bold">{gameState.pmf_score.toFixed(0)} / 100</div>
            <div className="text-xs text-emerald-300">前回比: {gameState.lastPmfDelta ? `${gameState.lastPmfDelta > 0 ? '+' : ''}${gameState.lastPmfDelta.toFixed(1)}` : '+0.0'}</div>
            <div className="text-xs text-slate-400">フェーズ: {phaseMeta.label}</div>
            <p className="text-xs text-slate-400">{phaseMeta.description}</p>
          </div>
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700 space-y-2">
            <div className="text-xs text-slate-400 uppercase">品質</div>
            <div className="text-2xl font-mono font-bold">{quality.toFixed(0)} / 100</div>
            <div className="text-xs text-slate-400">Tech Debt: {gameState.tech_debt}</div>
            <div className="text-xs text-slate-400">エンジニア採用で上昇しやすい</div>
          </div>
          <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700 space-y-2">
            <div className="text-xs text-slate-400 uppercase">平均単価</div>
            <div className="text-2xl font-mono font-bold">¥{averageUnitPrice.toLocaleString()}</div>
            <div className="text-xs text-slate-400">PMF/品質/営業人数で上昇、CS不足で低下</div>
          </div>
          <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700 space-y-2">
            <div className="text-xs text-slate-400 uppercase mb-1">職種の影響</div>
            <div className="flex justify-between"><span>エンジニア</span><span className="font-mono">{engCount}人</span></div>
            <div className="flex justify-between"><span>営業</span><span className="font-mono">{salesCount}人</span></div>
            <div className="flex justify-between"><span>CS</span><span className="font-mono">{csCount}人</span></div>
            <div className="flex justify-between"><span>マーケ</span><span className="font-mono">{marketingCount}人</span></div>
            <p className="text-[11px] text-slate-400 mt-2">品質と単価にどの職種が効いているかを把握し、採用計画に活かしてください。</p>
          </div>
        </div>
      </div>
    </div>
  );
};

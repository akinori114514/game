import React from 'react';
import { useGame } from '../context/GameContext';

interface Props {
  onClose: () => void;
  monthlyBurn: number;
}

export const FinancialsModal: React.FC<Props> = ({ onClose, monthlyBurn }) => {
  const { gameState } = useGame();
  const { cash, kpi, phase } = gameState;

  const founderSalary = 300000;
  const employeeSalaries = gameState.employees.reduce((sum, emp) => sum + emp.salary, 0);
  let officeRent = 0;
  if (phase === 'SERIES_A') officeRent = 500000;
  if (phase === 'SERIES_B') officeRent = 3000000;
  const serverCost = 10000 + (kpi.MRR * 0.05);
  const marketing = gameState.marketing_budget || 0;

  const runway = monthlyBurn > 0 ? cash / monthlyBurn : 99.9;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/60">
          <div>
            <h2 className="text-xl font-bold text-white">財務サマリー</h2>
            <p className="text-xs text-slate-400">手元資金とバーンの内訳をいつでも確認できます。</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">✕</button>
        </div>
        <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-200">
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 uppercase mb-1">現預金</div>
            <div className="text-2xl font-mono font-bold">¥{cash.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">ランウェイ: {runway.toFixed(1)} ヶ月</div>
          </div>
          <div className="p-4 bg-slate-800/60 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 uppercase mb-1">MRR</div>
            <div className="text-2xl font-mono font-bold">¥{kpi.MRR.toLocaleString()}</div>
            <div className="text-xs text-slate-400 mt-1">チャーン率: {(kpi.churn_rate * 100).toFixed(2)}%</div>
          </div>
          <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 uppercase mb-2">バーンレート内訳</div>
            <div className="flex justify-between"><span>創業者報酬</span><span className="font-mono">¥{founderSalary.toLocaleString()}/月</span></div>
            <div className="flex justify-between"><span>人件費</span><span className="font-mono">¥{employeeSalaries.toLocaleString()}/月</span></div>
            <div className="flex justify-between"><span>オフィス</span><span className="font-mono">¥{officeRent.toLocaleString()}/月</span></div>
            <div className="flex justify-between"><span>サーバー</span><span className="font-mono">¥{Math.round(serverCost).toLocaleString()}/月</span></div>
            <div className="flex justify-between"><span>マーケ</span><span className="font-mono">¥{marketing.toLocaleString()}/月</span></div>
            <div className="flex justify-between font-bold mt-2 border-t border-slate-700 pt-2"><span>合計</span><span className="font-mono text-red-300">-¥{Math.round(monthlyBurn).toLocaleString()}/月</span></div>
          </div>
          <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700">
            <div className="text-xs text-slate-400 uppercase mb-2">メモ</div>
            <ul className="text-slate-300 list-disc list-inside space-y-1">
              <li>バーンはターン開始時にリセットされる AP 消費とは別管理。</li>
              <li>MRR は毎ターン、人数ベースの成長ロジックで更新。</li>
              <li>大型イベント成功時は一時的に難易度が緩和されます。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

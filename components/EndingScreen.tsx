
import React from 'react';
import { GameState } from '../types';
import { Award, Ghost, Users, DollarSign } from 'lucide-react';

interface Props {
  state: GameState;
}

export const EndingScreen: React.FC<Props> = ({ state }) => {
  const { philosophy, cash, kpi, phase, investor_type } = state;

  // Determine Archetype
  let archetype = "The Unknown";
  let title = "名もなき起業家";
  let desc = "あなたの物語はここで終わった。";
  let color = "text-slate-400";
  let icon = <Ghost className="w-16 h-16 mb-4" />;

  const isRich = cash > 50000000 || kpi.MRR > 5000000;
  const isRuthless = philosophy.ruthlessness > 30;
  const isCraftsman = philosophy.craftsmanship > 30;
  const isDishonest = philosophy.dishonesty > 30;
  const isLonely = philosophy.loneliness > 40;

  if (isRich && isRuthless) {
    archetype = "The Tyrant King";
    title = "孤独な王";
    desc = "あなたは巨万の富を築いたが、周りには誰もいなかった。業界はあなたを恐れ、そして憎んだ。葬式に来る人は少ないだろうが、あなたの建てたビルは長く残るだろう。";
    color = "text-red-500";
    icon = <Award className="w-16 h-16 mb-4 text-red-500" />;
  } else if (isRich && isDishonest) {
    archetype = "The Fraud";
    title = "虚飾の偶像";
    desc = "数字は嘘をつかないが、あなたは数字についた。いつか監査が入るその日まで、あなたは高級車を乗り回し、SNSで成功哲学を語り続けるだろう。";
    color = "text-yellow-500";
    icon = <DollarSign className="w-16 h-16 mb-4 text-yellow-500" />;
  } else if (!isRich && isCraftsman) {
    archetype = "The Dreamer";
    title = "夢見た職人";
    desc = "会社は倒産したが、あなたが作ったプロダクトの一部はオープンソースとして生き残った。一部の熱狂的なファンは、今でもあなたのコードを愛している。";
    color = "text-blue-400";
    icon = <TerminalIcon className="w-16 h-16 mb-4 text-blue-400" />;
  } else if (!isRich && !isRuthless && !isLonely) {
    archetype = "The Saint";
    title = "愛された敗者";
    desc = "ユニコーンにはなれなかった。しかし、あなたの会社の同窓会には、今でも多くの元社員が笑顔で集まる。あなたは幸せな人生を送った。";
    color = "text-emerald-400";
    icon = <Users className="w-16 h-16 mb-4 text-emerald-400" />;
  } else {
    // Default / Mixed
    title = "ある起業家の記録";
    desc = "挑戦し、戦い、そして燃え尽きた。2020年の東京を駆け抜けた、一つの魂の記録。";
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-1000">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 p-10 rounded-2xl shadow-2xl text-center">
        <div className="flex justify-center">{icon}</div>
        <h1 className={`text-4xl font-bold mb-2 ${color}`}>{title}</h1>
        <p className="text-slate-500 uppercase tracking-widest text-sm mb-8">{archetype}</p>
        
        <div className="bg-black/40 p-6 rounded-xl text-slate-300 leading-loose italic mb-8 font-serif">
          "{desc}"
        </div>

        <div className="grid grid-cols-2 gap-4 text-left bg-slate-800/50 p-6 rounded-lg mb-8">
          <div>
            <div className="text-xs text-slate-500 uppercase">Final Phase</div>
            <div className="font-bold text-white">{phase}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">Investor</div>
            <div className="font-bold text-white">{investor_type}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500 uppercase">Cash Remaining</div>
            <div className="font-bold text-white">¥{cash.toLocaleString()}</div>
          </div>
           <div>
            <div className="text-xs text-slate-500 uppercase">Philosophy</div>
            <div className="font-bold text-white text-xs mt-1">
               R:{philosophy.ruthlessness} / C:{philosophy.craftsmanship} / L:{philosophy.loneliness}
            </div>
          </div>
        </div>

        <button 
          onClick={() => window.location.reload()} 
          className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
        >
          Reincarnate (転生する)
        </button>
      </div>
    </div>
  );
};

const TerminalIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
);

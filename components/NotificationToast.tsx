
import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { MessageSquare, AlertTriangle, Terminal, Globe, Server, Hash, HeartCrack } from 'lucide-react';
import { GameNotification, NotificationType } from '../types';

export const NotificationToast = () => {
  const { gameState, openSocialPost } = useGame();
  const { notifications, is_machine_mode, is_decision_mode } = gameState;
  const [activeToasts, setActiveToasts] = useState<GameNotification[]>([]);

  // When notifications change, detect new ones and add to activeToasts
  useEffect(() => {
    if (notifications.length === 0) return;
    
    const latest = notifications[notifications.length - 1];
    // Only show if it was created recently (e.g., in the last second)
    // This prevents flood on re-render
    if (Date.now() - latest.timestamp < 1000) {
        setActiveToasts(prev => {
            // Avoid duplicates
            if (prev.some(n => n.id === latest.id)) return prev;
            return [...prev, latest];
        });

        // Remove after delay
        setTimeout(() => {
            setActiveToasts(prev => prev.filter(n => n.id !== latest.id));
        }, 5000);
    }
  }, [notifications]);

  if (is_decision_mode) return null;

  const getIcon = (note: GameNotification) => {
    if (note.tone === 'FAMILY_ANGRY') return <HeartCrack size={16} className="text-red-100 animate-pulse" />;
    
    switch (note.type) {
      case 'SLACK': return <MessageSquare size={16} className="text-white" />;
      case 'SYSTEM': return <Server size={16} className="text-blue-200" />;
      case 'ALERT': return <AlertTriangle size={16} className="text-yellow-200" />;
      case 'NEWS': return <Globe size={16} className="text-emerald-200" />;
      case 'DEATH': return <Terminal size={16} className="text-red-200" />;
      case 'SOCIAL': return <Hash size={16} className="text-white" />;
      case 'FAMILY_DM': return <MessageSquare size={16} className="text-white" />;
      default: return <MessageSquare size={16} />;
    }
  };

  const getToneStyles = (tone?: string) => {
      if (tone === 'FAMILY_ANGRY') return 'bg-red-900/90 border-red-500 shadow-red-500/20 shake-animation';
      if (tone === 'FAMILY_LOVE') return 'bg-pink-900/80 border-pink-400 shadow-pink-500/20';
      if (tone === 'ROBOTIC') return 'bg-black border-green-500 text-green-400 font-mono rounded-none';
      if (tone === 'URGENT') return 'bg-yellow-900/90 border-yellow-500 shadow-yellow-500/20';
      return 'bg-slate-900/80 border-white/10 text-white';
  };

  return (
    <div className="fixed top-6 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake-animation { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {activeToasts.map((note) => (
        <div 
            key={note.id}
            onClick={() => {
                if (note.type === 'SOCIAL' && note.relatedPostId) {
                    openSocialPost(note.relatedPostId);
                }
            }}
            className={`
                pointer-events-auto
                w-80 p-4 rounded-lg shadow-2xl backdrop-blur-xl border transition-all duration-500 cursor-pointer
                animate-in slide-in-from-right-10 fade-in
                ${getToneStyles(note.tone)}
                hover:scale-105 active:scale-95
            `}
        >
            <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${
                     note.tone === 'ROBOTIC' ? 'bg-green-900/30' :
                     note.tone === 'FAMILY_ANGRY' ? 'bg-red-700' :
                     note.type === 'SLACK' ? 'bg-[#4A154B]' : 
                     note.type === 'ALERT' ? 'bg-yellow-600' : 
                     note.type === 'NEWS' ? 'bg-emerald-600' : 
                     note.type === 'SOCIAL' ? 'bg-black border border-white/20' : 
                     note.type === 'FAMILY_DM' ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                    {getIcon(note)}
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                         <span className={`text-[10px] font-bold uppercase tracking-wider ${note.tone === 'ROBOTIC' ? 'text-green-600' : 'text-white/50'}`}>
                             {note.type}
                         </span>
                         <span className="text-[10px] opacity-50">now</span>
                    </div>
                    <p className={`text-sm font-medium leading-snug ${note.tone === 'ROBOTIC' ? 'text-green-300' : 'text-white/90'}`}>
                        {note.message}
                    </p>
                </div>
            </div>
        </div>
      ))}
    </div>
  );
};

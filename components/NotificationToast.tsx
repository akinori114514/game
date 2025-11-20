
import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { MessageSquare, AlertTriangle, Terminal, Globe, Server, Hash, HeartCrack } from 'lucide-react';
import { GameNotification, NotificationType } from '../types';

interface ToastEntry {
  note: GameNotification;
  count: number;
  timeoutId?: number;
}

export const NotificationToast = () => {
  const { gameState, openSocialPost } = useGame();
  const { notifications, is_machine_mode, is_decision_mode } = gameState;
  const [activeToasts, setActiveToasts] = useState<ToastEntry[]>([]);
  const [dragOffsets, setDragOffsets] = useState<Record<string, number>>({});
  const touchStarts = useRef<Record<string, number>>({});

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(entry => entry.note.id !== id));
  };

  const finalizeSwipe = (id: string) => {
    const offset = dragOffsets[id] || 0;
    if (Math.abs(offset) > 80) {
        removeToast(id);
    }
    setDragOffsets(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
    });
    delete touchStarts.current[id];
  };

  useEffect(() => {
    if (notifications.length === 0) return;
    const latest = notifications[notifications.length - 1];

    if (Date.now() - latest.timestamp < 1000) {
        setActiveToasts(prev => {
            const existingIndex = prev.findIndex(entry => entry.note.message === latest.message && entry.note.type === latest.type);
            const scheduleRemoval = (id: string) => {
              if (typeof window === 'undefined') return undefined;
              return window.setTimeout(() => {
                  setActiveToasts(current => current.filter(entry => entry.note.id !== id));
              }, 5000);
            };

            if (existingIndex >= 0) {
                const existing = prev[existingIndex];
                if (existing.timeoutId && typeof window !== 'undefined') {
                    window.clearTimeout(existing.timeoutId);
                }
                const timeoutId = scheduleRemoval(latest.id);
                const updatedEntry = { ...existing, note: latest, count: existing.count + 1, timeoutId };
                return [...prev.slice(0, existingIndex), updatedEntry, ...prev.slice(existingIndex + 1)];
            }

            const timeoutId = scheduleRemoval(latest.id);
            return [...prev, { note: latest, count: 1, timeoutId }];
        });
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
    <div className="fixed top-16 right-6 z-[60] flex flex-col gap-3 pointer-events-none">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake-animation { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>

      {activeToasts.map((entry) => (
        <div 
            key={entry.note.id}
            onClick={() => {
                if (entry.note.type === 'SOCIAL' && entry.note.relatedPostId) {
                    openSocialPost(entry.note.relatedPostId);
                }
            }}
            style={{ transform: `translateX(${dragOffsets[entry.note.id] || 0}px)` }}
            className={`
                pointer-events-auto
                w-80 p-4 rounded-lg shadow-2xl backdrop-blur-xl border transition-all duration-500 cursor-pointer
                animate-in slide-in-from-right-10 fade-in
                ${getToneStyles(entry.note.tone)}
                hover:scale-105 active:scale-95
            `}
        >
            <div 
                className="flex items-start gap-3"
                onTouchStart={(event) => {
                    touchStarts.current[entry.note.id] = event.touches[0].clientX;
                }}
                onTouchMove={(event) => {
                    const start = touchStarts.current[entry.note.id] ?? event.touches[0].clientX;
                    const delta = event.touches[0].clientX - start;
                    setDragOffsets(prev => ({ ...prev, [entry.note.id]: delta }));
                }}
                onTouchEnd={() => finalizeSwipe(entry.note.id)}
                onMouseDown={(event) => {
                    touchStarts.current[entry.note.id] = event.clientX;
                }}
                onMouseMove={(event) => {
                    if (touchStarts.current[entry.note.id] !== undefined) {
                        const delta = event.clientX - touchStarts.current[entry.note.id];
                        setDragOffsets(prev => ({ ...prev, [entry.note.id]: delta }));
                    }
                }}
                onMouseUp={() => finalizeSwipe(entry.note.id)}
            >
                <div className={`p-2 rounded-lg ${
                     entry.note.tone === 'ROBOTIC' ? 'bg-green-900/30' :
                     entry.note.tone === 'FAMILY_ANGRY' ? 'bg-red-700' :
                     entry.note.type === 'SLACK' ? 'bg-[#4A154B]' : 
                     entry.note.type === 'ALERT' ? 'bg-yellow-600' : 
                     entry.note.type === 'NEWS' ? 'bg-emerald-600' : 
                     entry.note.type === 'SOCIAL' ? 'bg-black border border-white/20' : 
                     entry.note.type === 'FAMILY_DM' ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                    {getIcon(entry.note)}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                         <span className={`text-[10px] font-bold uppercase tracking-wider ${entry.note.tone === 'ROBOTIC' ? 'text-green-600' : 'text-white/50'}`}>
                             {entry.note.type}
                         </span>
                         <span className="text-[10px] opacity-50">now</span>
                    </div>
                    <p className={`text-sm font-medium leading-snug ${entry.note.tone === 'ROBOTIC' ? 'text-green-300' : 'text-white/90'}`}>
                        {entry.note.message}
                    </p>
                    {entry.count > 1 && (
                        <div className="text-[10px] text-white/60 mt-2">同内容が{entry.count}件</div>
                    )}
                </div>
            </div>
        </div>
      ))}
    </div>
  );
};

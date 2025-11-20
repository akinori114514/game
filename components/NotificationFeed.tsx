
import React, { useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { MessageSquare, AlertTriangle, Terminal, Globe, Server, Hash, Battery, Wifi, Signal } from 'lucide-react';
import { NotificationType } from '../types';

export const NotificationFeed = () => {
  const { gameState, openSocialPost } = useGame();
  const { notifications, is_machine_mode, is_decision_mode } = gameState;
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [notifications, is_machine_mode]);

  if (is_decision_mode) return null; // Hide noise during critical decisions

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'SLACK': return <MessageSquare size={12} className="text-slate-400" />;
      case 'SYSTEM': return <Server size={12} className="text-blue-400" />;
      case 'ALERT': return <AlertTriangle size={12} className="text-yellow-500" />;
      case 'NEWS': return <Globe size={12} className="text-emerald-400" />;
      case 'DEATH': return <Terminal size={12} className="text-red-500" />;
      case 'SOCIAL': return <Hash size={12} className="text-white" />;
      default: return <MessageSquare size={12} />;
    }
  };

  // MACHINE MODE RENDER (Cyberpunk Terminal Style)
  if (is_machine_mode) {
    return (
      <div className="fixed bottom-6 right-6 w-80 z-40 border-2 border-green-500/50 bg-black/95 font-mono text-[10px] rounded-sm shadow-[0_0_30px_rgba(34,197,94,0.2)] overflow-hidden animate-in fade-in duration-1000">
        <div className="p-2 bg-green-900/20 border-b border-green-500/30 flex justify-between items-center">
            <span className="text-green-500 font-bold flex items-center gap-2 animate-pulse">
                <Terminal size={10} /> SYSTEM OVERRIDE
            </span>
            <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-green-800 rounded-full"></div>
                <div className="w-1.5 h-1.5 bg-green-800 rounded-full"></div>
            </div>
        </div>
        <div className="flex flex-col p-2 space-y-1 max-h-64 overflow-y-auto custom-scrollbar bg-[linear-gradient(0deg,rgba(0,20,0,0.5)_1px,transparent_1px)] bg-[length:100%_4px]">
           {notifications.slice(-10).map((note) => (
               <div key={note.id} className="text-green-400 break-all leading-tight font-mono opacity-90 hover:opacity-100 hover:bg-green-900/30 transition-colors">
                   <span className="text-green-700 mr-2">[{new Date(note.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
                   <span className="text-green-300">{note.type === 'SLACK' ? '>> HUMAN_INPUT:' : '>> SYSTEM_LOG:'}</span> {note.message.toUpperCase()}
               </div>
           ))}
           <div ref={bottomRef} />
        </div>
        <div className="h-1 w-full bg-green-500/20 animate-pulse"></div>
      </div>
    );
  }

  // NORMAL MODE RENDER (SMARTPHONE STYLE)
  return (
    <div className="fixed bottom-6 right-6 w-80 z-40 pointer-events-auto flex flex-col gap-2 transition-all duration-500">
      {/* Phone Container */}
      <div className="bg-black/80 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] overflow-hidden shadow-2xl shadow-black ring-4 ring-black">
          
          {/* Phone Status Bar */}
          <div className="bg-transparent px-5 py-3 flex justify-between items-center text-[10px] text-white/80 font-medium">
              <span className="">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              <div className="flex items-center gap-1.5">
                  <Signal size={10} />
                  <Wifi size={10} />
                  <Battery size={10} />
              </div>
          </div>

          {/* Notification List */}
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar p-3 pt-0 min-h-[300px] mask-image-linear-gradient-to-b">
            {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-20 text-slate-500/50 text-xs">
                    <span className="mb-1">No Notifications</span>
                </div>
            )}
            {notifications.slice(-6).map((note) => (
                <div 
                    key={note.id}
                    onClick={() => note.type === 'SOCIAL' && note.relatedPostId && openSocialPost(note.relatedPostId)} 
                    className={`
                        relative rounded-2xl p-3 shadow-lg backdrop-blur-md border flex flex-col gap-1 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]
                        ${note.type === 'SOCIAL' ? 'bg-black/80 border-slate-800' : 'bg-slate-800/40 border-white/10'}
                        ${note.type === 'ALERT' ? 'border-yellow-500/30 bg-yellow-900/40' : ''}
                        animate-in slide-in-from-bottom-4 duration-300
                    `}
                >
                <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-lg shadow-inner ${
                        note.type === 'SLACK' ? 'bg-[#4A154B]' : 
                        note.type === 'ALERT' ? 'bg-yellow-500' : 
                        note.type === 'NEWS' ? 'bg-emerald-500' : 
                        note.type === 'SOCIAL' ? 'bg-black border border-white/20' : 'bg-blue-500'
                    }`}>
                        {getIcon(note.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-wide drop-shadow-sm">{note.type}</span>
                            <span className="text-[9px] text-white/40">now</span>
                        </div>
                        <p className={`text-xs leading-snug break-words ${note.type === 'ALERT' ? 'text-yellow-100 font-bold' : note.type === 'SOCIAL' ? 'text-slate-200' : 'text-white/90'}`}>
                            {note.message}
                        </p>
                    </div>
                </div>
                </div>
            ))}
            <div ref={bottomRef} />
          </div>
          
          {/* Home Indicator */}
          <div className="h-6 flex justify-center items-center bg-transparent pb-1">
              <div className="w-14 h-1 bg-white/20 rounded-full backdrop-blur-sm"></div>
          </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { Grid, Signal, Wifi, Battery, Terminal } from 'lucide-react';
import { PhoneHomeScreen, PhoneMessagesApp, PhoneSlackApp, PhoneSocialApp } from './PhoneApps';

export const Smartphone = () => {
  const { gameState, unreadCount, markAllAsRead } = useGame();
  const { notifications, is_machine_mode, is_decision_mode } = gameState;
  
  const [isOpen, setIsOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState<'HOME' | 'MESSAGES' | 'SLACK' | 'SOCIAL'>('HOME');
  
  const togglePhone = () => {
      if (!isOpen) {
          setIsOpen(true);
          markAllAsRead();
          setCurrentApp('HOME');
      } else {
          setIsOpen(false);
      }
  };

  if (is_decision_mode) return null;

  // MACHINE MODE RENDER
  if (is_machine_mode) {
    return (
      <div className="fixed bottom-4 left-6 w-72 z-40 border-2 border-green-500/50 bg-black/95 font-mono text-[10px] rounded-sm shadow-[0_0_30px_rgba(34,197,94,0.2)] overflow-hidden animate-in fade-in duration-1000">
        <div className="p-2 bg-green-900/20 border-b border-green-500/30 flex justify-between items-center">
            <span className="text-green-500 font-bold flex items-center gap-2 animate-pulse">
                <Terminal size={10} /> SYS_ACCESS_PORT
            </span>
            <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            </div>
        </div>
        <div className="flex flex-col p-2 space-y-1 max-h-48 overflow-y-auto custom-scrollbar bg-[linear-gradient(0deg,rgba(0,20,0,0.5)_1px,transparent_1px)] bg-[length:100%_4px]">
           {notifications.slice(-5).map((note) => (
               <div key={note.id} className="text-green-400 break-all leading-tight font-mono opacity-90">
                   <span className="text-green-700 mr-2">[{new Date(note.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
                   <span className="text-green-300">{note.type === 'SLACK' ? '>> HUMAN_INPUT:' : '>> SYSTEM_LOG:'}</span> {note.message.toUpperCase()}
               </div>
           ))}
        </div>
      </div>
    );
  }

  // CLOSED STATE (ICON)
  if (!isOpen) {
      return (
          <button 
            onClick={togglePhone}
            className="fixed bottom-4 left-6 z-40 w-12 h-12 bg-black border border-slate-700 rounded-2xl shadow-2xl hover:scale-105 transition-transform flex items-center justify-center group"
          >
              <Grid size={20} className="text-white group-hover:text-indigo-400" />
              {unreadCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-slate-900 animate-bounce">
                      {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
              )}
          </button>
      );
  }

  // OPEN STATE
  return (
    <div className="fixed bottom-4 left-6 w-[300px] h-[550px] z-40 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 origin-bottom-left scale-90">
      {/* Phone Container */}
      <div className="relative w-full h-full bg-black rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-7 bg-black z-20 flex justify-between items-center px-6 text-[10px] text-white font-medium">
               <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
               <div className="flex gap-1">
                   <Signal size={10} />
                   <Wifi size={10} />
                   <Battery size={10} />
               </div>
          </div>
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-5 bg-black rounded-full z-20"></div>

          {/* APP CONTENT */}
          <div className="flex-1 pt-10 pb-6 bg-gradient-to-b from-slate-900 to-black text-white overflow-hidden relative">
              {currentApp === 'HOME' && <PhoneHomeScreen onOpenApp={setCurrentApp} />}
              {currentApp === 'MESSAGES' && <PhoneMessagesApp onBack={() => setCurrentApp('HOME')} />}
              {currentApp === 'SLACK' && <PhoneSlackApp onBack={() => setCurrentApp('HOME')} />}
              {currentApp === 'SOCIAL' && <PhoneSocialApp onBack={() => setCurrentApp('HOME')} />}
          </div>

          {/* Home Bar */}
          <div className="absolute bottom-1 left-0 right-0 h-6 flex justify-center items-center z-20" onClick={togglePhone}>
              <div className="w-24 h-1 bg-white/20 rounded-full cursor-pointer hover:bg-white/40 transition-colors"></div>
          </div>
      </div>
    </div>
  );
};

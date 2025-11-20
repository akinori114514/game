
import React from 'react';
import { useGame } from '../context/GameContext';
import { MessageSquare, Hash, Mail, CreditCard, Settings, ChevronLeft, Bell, AlertTriangle, UserX, Heart, HeartCrack } from 'lucide-react';

interface AppProps {
    onBack: () => void;
}

// --- HOME SCREEN (LAUNCHER) ---
export const PhoneHomeScreen: React.FC<{ onOpenApp: (app: 'MESSAGES' | 'SLACK' | 'SOCIAL') => void }> = ({ onOpenApp }) => {
    const { gameState } = useGame();
    const unreadMessages = gameState.notifications.filter(n => n.type === 'FAMILY_DM' && !n.isRead).length;
    const unreadSlack = gameState.notifications.filter(n => n.type === 'SLACK' && !n.isRead).length;

    return (
        <div className="grid grid-cols-4 gap-4 p-4 animate-in zoom-in-95 duration-200">
            {/* MESSAGES (FAMILY) */}
            <div className="flex flex-col items-center gap-1 relative" onClick={() => onOpenApp('MESSAGES')}>
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:brightness-110 transition-all relative">
                    <MessageSquare size={24} className="text-white" />
                    {unreadMessages > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold border border-white">
                            {unreadMessages}
                        </div>
                    )}
                </div>
                <span className="text-[10px] font-medium">Messages</span>
            </div>

            {/* SLACK (WORK) */}
            <div className="flex flex-col items-center gap-1 relative" onClick={() => onOpenApp('SLACK')}>
                <div className="w-12 h-12 bg-[#4A154B] rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:brightness-110 transition-all relative">
                    <Hash size={24} className="text-white" />
                    {unreadSlack > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold border border-white">
                            {unreadSlack}
                        </div>
                    )}
                </div>
                <span className="text-[10px] font-medium">Slack</span>
            </div>

            {/* SOCIAL (X) */}
            <div className="flex flex-col items-center gap-1" onClick={() => onOpenApp('SOCIAL')}>
                <div className="w-12 h-12 bg-black border border-slate-700 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:border-white transition-all">
                    <Hash size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-medium">X</span>
            </div>

            {/* DUMMY APPS */}
            <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:brightness-110 transition-all">
                    <Mail size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-medium">Mail</span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:brightness-110 transition-all">
                    <CreditCard size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-medium">Bank</span>
            </div>

            <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 bg-slate-600 rounded-xl flex items-center justify-center shadow-lg cursor-pointer hover:brightness-110 transition-all">
                    <Settings size={24} className="text-white" />
                </div>
                <span className="text-[10px] font-medium">Settings</span>
            </div>
        </div>
    );
};

// --- MESSAGES APP (FAMILY DM ONLY) ---
export const PhoneMessagesApp: React.FC<AppProps> = ({ onBack }) => {
    const { gameState } = useGame();
    const msgs = gameState.notifications.filter(n => n.type === 'FAMILY_DM').slice().reverse();
    const rel = gameState.family_relationship;

    // Dynamic Contact Name based on Relationship
    let contactName = "Honey ❤️";
    let status = "Online";
    let headerColor = "text-blue-400";
    
    if (rel < 70) { contactName = "Wife"; status = "Last seen yesterday"; headerColor = "text-slate-400"; }
    if (rel < 40) { contactName = "Martha"; status = "Busy"; headerColor = "text-slate-500"; }
    if (rel <= 10) { contactName = "Blocked User"; status = "Offline"; headerColor = "text-red-400"; }

    return (
        <div className="h-full flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-slate-200 bg-slate-100 text-slate-800 shadow-sm">
                <button onClick={onBack} className="text-blue-500 flex items-center text-sm font-medium">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex flex-col items-center flex-1 mr-6">
                    <div className="flex items-center gap-1">
                        <span className={`font-bold text-xs ${headerColor}`}>{contactName}</span>
                        {rel > 80 && <Heart size={10} className="text-pink-500 fill-pink-500" />}
                        {rel < 30 && <HeartCrack size={10} className="text-slate-400" />}
                    </div>
                    {rel > 10 && <span className="text-[9px] text-slate-400">{status}</span>}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-white text-slate-900 flex flex-col-reverse">
                {/* Silence Indicator */}
                {rel <= 10 && (
                    <div className="text-center my-4">
                        <span className="text-[10px] text-red-400 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                            User has blocked communications.
                        </span>
                    </div>
                )}

                {msgs.length === 0 && rel > 10 && (
                    <div className="text-center text-slate-400 text-xs mt-10">Start of conversation</div>
                )}

                {msgs.map(msg => {
                    // Tone-based styling
                    let bubbleClass = "bg-slate-200 text-slate-800";
                    if (msg.tone === 'FAMILY_ANGRY') bubbleClass = "bg-red-100 text-red-900 border border-red-200";
                    if (msg.tone === 'FAMILY_SAD') bubbleClass = "bg-indigo-50 text-indigo-800 italic";
                    if (msg.tone === 'FAMILY_LOVE') bubbleClass = "bg-green-100 text-green-900";

                    return (
                        <div key={msg.id} className="flex flex-col gap-1 self-start max-w-[85%] animate-in fade-in slide-in-from-left-2 duration-300">
                            <div className={`rounded-2xl rounded-tl-none px-3 py-2 text-xs shadow-sm ${bubbleClass}`}>
                                {msg.message}
                            </div>
                            <span className="text-[9px] text-slate-400 ml-1">
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Input Area (Disabled mostly) */}
            <div className="p-3 border-t border-slate-200 bg-slate-50">
                <div className="bg-white border border-slate-300 rounded-full h-8 px-3 flex items-center text-slate-400 text-xs">
                    {rel <= 10 ? "You cannot reply to this conversation." : "iMessage"}
                </div>
            </div>
        </div>
    );
};

// --- SLACK APP (WORK ONLY) ---
export const PhoneSlackApp: React.FC<AppProps> = ({ onBack }) => {
    const { gameState } = useGame();
    // Filter work related notifications
    const msgs = gameState.notifications.filter(n => ['SLACK', 'SYSTEM', 'ALERT', 'NEWS'].includes(n.type)).slice().reverse();

    return (
        <div className="h-full flex flex-col animate-in slide-in-from-right duration-200 bg-[#1a1d21]">
             <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10 bg-[#350d36] text-white">
                <button onClick={onBack} className="flex items-center text-sm opacity-80 hover:opacity-100">
                    <ChevronLeft size={16} /> 
                </button>
                <h3 className="font-bold text-sm"># general</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar flex flex-col-reverse">
                {msgs.map(msg => (
                     <div key={msg.id} className={`flex gap-2 items-start animate-in fade-in duration-300 ${msg.tone === 'URGENT' ? 'opacity-100' : 'opacity-80'}`}>
                         <div className={`w-8 h-8 rounded bg-slate-700 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white ${msg.type === 'ALERT' ? 'bg-yellow-600' : msg.type === 'NEWS' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                             {msg.type[0]}
                         </div>
                         <div className="flex-1 min-w-0">
                             <div className="flex items-baseline gap-2">
                                 <span className="font-bold text-[11px] text-slate-300">{msg.type}</span>
                                 <span className="text-[9px] text-slate-500">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                             <div className={`text-[11px] leading-snug break-words ${msg.tone === 'URGENT' ? 'text-yellow-200 font-medium' : 'text-slate-400'}`}>
                                 {msg.message}
                             </div>
                         </div>
                     </div>
                ))}
            </div>
        </div>
    );
};

// --- SOCIAL APP (X) ---
export const PhoneSocialApp: React.FC<AppProps> = ({ onBack }) => {
    const { gameState, openSocialPost } = useGame();
    
    return (
        <div className="h-full flex flex-col animate-in slide-in-from-right duration-200 bg-black text-white">
            <div className="px-4 py-3 flex items-center gap-2 border-b border-white/10">
              <button onClick={onBack} className="text-white flex items-center text-sm">
                  <ChevronLeft size={16} /> Back
              </button>
              <Hash size={16} className="text-white" />
          </div>
          <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
              {gameState.active_social_post ? (
                  <button 
                    onClick={() => openSocialPost(gameState.active_social_post!.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:scale-105 transition-transform"
                  >
                    View Active Thread
                  </button>
              ) : (
                  <>
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-2">
                        <Hash className="text-slate-500" />
                    </div>
                    <div className="text-xs text-slate-400">No new trending posts.</div>
                    <div className="text-[10px] text-slate-600 mt-2">Check back later for mentions.</div>
                  </>
              )}
          </div>
       </div>
    );
}

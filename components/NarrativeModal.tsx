
import React from 'react';
import { NarrativeEvent } from '../types';
import { AlertTriangle, Terminal } from 'lucide-react';
import { TypewriterText } from './TypewriterText';
import { HeavyButton } from './HeavyButton';

interface Props {
  event: NarrativeEvent;
  onResolve: (choiceId: string) => void;
}

export const NarrativeModal: React.FC<Props> = ({ event, onResolve }) => {
  const isCritical = event.severity === 'CRITICAL';

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className={`max-w-2xl w-full border-2 rounded-xl shadow-2xl overflow-hidden ${event.is_crisis || isCritical ? 'bg-red-950/30 border-red-500' : 'bg-slate-900 border-slate-600'}`}>
        
        {/* Header */}
        <div className={`p-6 border-b ${event.is_crisis || isCritical ? 'border-red-500/50 bg-red-900/20' : 'border-slate-700 bg-slate-800'}`}>
          <div className="flex items-center gap-3">
            {event.is_crisis || isCritical ? (
              <AlertTriangle className="w-8 h-8 text-red-500 animate-pulse" />
            ) : (
              <Terminal className="w-8 h-8 text-emerald-400" />
            )}
            <h2 className={`text-2xl font-bold tracking-tight ${event.is_crisis || isCritical ? 'text-red-100' : 'text-white'}`}>
              {event.title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-lg text-slate-300 leading-relaxed whitespace-pre-wrap min-h-[100px]">
            {isCritical ? (
                <TypewriterText text={event.description} speed={30} />
            ) : (
                event.description
            )}
          </div>
        </div>

        {/* Choices */}
        <div className="p-6 bg-black/20 flex flex-col gap-3">
          {event.choices.map((choice) => {
              const ChoiceContent = (
                  <div className="flex justify-between items-center w-full">
                      <div className="text-left">
                          <div className="font-bold group-hover:text-white">{choice.label}</div>
                          {choice.description && (
                              <div className="text-xs opacity-60 mt-1 font-mono">{choice.description}</div>
                          )}
                      </div>
                      <span className="text-xl opacity-0 group-hover:opacity-100 transition-opacity">➜</span>
                  </div>
              );

              // Use HeavyButton if Critical
              if (isCritical) {
                  return (
                      <HeavyButton 
                          key={choice.id}
                          label={choice.label + (choice.description ? ` - ${choice.description}` : '')}
                          onClick={() => onResolve(choice.id)}
                          className="w-full p-6 rounded-lg border border-red-800 bg-red-900/10 text-red-200 hover:bg-red-900/30 hover:border-red-500 transition-all"
                      />
                  );
              }

              return (
                <button
                  key={choice.id}
                  onClick={() => onResolve(choice.id)}
                  className={`
                    w-full p-4 rounded-lg border text-left transition-all flex justify-between items-center group
                    ${event.is_crisis 
                      ? 'border-red-800 bg-red-900/10 hover:bg-red-900/30 hover:border-red-500 text-red-200' 
                      : 'border-slate-700 bg-slate-800 hover:bg-slate-700 hover:border-indigo-500 text-slate-200'}
                  `}
                >
                  {ChoiceContent}
                </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

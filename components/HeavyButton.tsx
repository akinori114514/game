
import React, { useState, useRef, useEffect } from 'react';

interface Props {
  onClick: () => void;
  label: string;
  className?: string;
  disabled?: boolean;
}

export const HeavyButton: React.FC<Props> = ({ onClick, label, className = '', disabled = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const REQUIRED_HOLD_MS = 2000;

  const startPress = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();
    setIsPressed(true);
    startTimeRef.current = Date.now();
    
    // Vibration effect if supported
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const endPress = () => {
    setIsPressed(false);
    setProgress(0);
    if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
    }
  };

  const animate = () => {
    if (!startTimeRef.current) return;
    const elapsed = Date.now() - startTimeRef.current;
    const newProgress = Math.min(100, (elapsed / REQUIRED_HOLD_MS) * 100);
    
    setProgress(newProgress);

    if (newProgress >= 100) {
      // Trigger Action
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      onClick();
      endPress();
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isPressed) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current !== null) {
          cancelAnimationFrame(requestRef.current);
      }
    }
    return () => {
        if (requestRef.current !== null) {
            cancelAnimationFrame(requestRef.current);
        }
    };
  }, [isPressed]);

  return (
    <button
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      disabled={disabled}
      className={`relative overflow-hidden group select-none ${className} ${isPressed ? 'scale-[0.98]' : ''} transition-transform duration-100`}
    >
      {/* Progress Fill */}
      <div 
        className="absolute top-0 left-0 bottom-0 bg-red-600/50 z-0 transition-none" 
        style={{ width: `${progress}%` }}
      ></div>

      {/* Shake Effect Container */}
      <div className={`relative z-10 flex items-center justify-between w-full ${isPressed ? 'animate-shake' : ''}`}>
        <span>{label}</span>
        {isPressed && <span className="text-xs font-mono animate-pulse text-red-200">HOLD...</span>}
      </div>

      {/* Style helper for Shake Animation */}
      <style>{`
        @keyframes shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -2px) rotate(-1deg); }
          20% { transform: translate(-3px, 0px) rotate(1deg); }
          30% { transform: translate(3px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 2px) rotate(-1deg); }
          60% { transform: translate(-3px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-1px, -1px) rotate(1deg); }
          90% { transform: translate(1px, 2px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
        .animate-shake {
          animation: shake 0.5s infinite;
        }
      `}</style>
    </button>
  );
};

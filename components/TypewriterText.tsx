
import React, { useState, useEffect } from 'react';

interface Props {
  text: string;
  speed?: number;
  onComplete?: () => void;
}

export const TypewriterText: React.FC<Props> = ({ text, speed = 50, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <span className="whitespace-pre-wrap">{displayedText}</span>;
};

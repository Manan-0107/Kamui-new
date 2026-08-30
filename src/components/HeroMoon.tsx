'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';

export const HeroMoon: React.FC = () => {
  const { cycleTheme } = useTheme();
  const [pulsing, setPulsing] = useState(false);

  const handleClick = () => {
    setPulsing(false);
    // trigger reflow animation
    setTimeout(() => {
      setPulsing(true);
      cycleTheme(true);
    }, 10);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className={`hero-moon ${pulsing ? 'pulse' : ''}`}
      id="heroMoon"
      role="button"
      tabIndex={0}
      title="Click to shift realm theme"
      aria-label="Shift realm theme"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onAnimationEnd={() => setPulsing(false)}
    >
      <span className="moon-hint">✦ Click to Shift Realm</span>
    </div>
  );
};

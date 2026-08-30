'use client';

import React, { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

interface Particle {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  alpha: number;
  hue: string;
}

export const EmberCanvas: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { currentTheme } = useTheme();
  const currentHuesRef = useRef<[string, string]>(currentTheme.hues);

  useEffect(() => {
    currentHuesRef.current = currentTheme.hues;
  }, [currentTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const makeParticle = (): Particle => {
      const activeHues = currentHuesRef.current;
      return {
        x: Math.random() * w,
        y: h + Math.random() * 100,
        r: 0.6 + Math.random() * 2,
        speed: 0.25 + Math.random() * 0.7,
        drift: (Math.random() - 0.5) * 0.4,
        alpha: 0.15 + Math.random() * 0.5,
        hue: Math.random() > 0.6 ? activeHues[0] : activeHues[1]
      };
    };

    const count = Math.min(90, Math.floor((w * h) / 14000));
    let particles: Particle[] = Array.from({ length: count }, makeParticle);

    const resize = () => {
      if (!canvas) return;
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      const newCount = Math.min(90, Math.floor((w * h) / 14000));
      particles = Array.from({ length: newCount }, makeParticle);
    };

    window.addEventListener('resize', resize);

    const onThemeChange = (e: Event) => {
      const custom = e as CustomEvent<{ hues: [string, string] }>;
      if (custom.detail && custom.detail.hues) {
        currentHuesRef.current = custom.detail.hues;
        particles.forEach((p) => {
          p.hue = Math.random() > 0.6 ? custom.detail.hues[0] : custom.detail.hues[1];
        });
      }
    };

    window.addEventListener('kamui-theme-changed', onThemeChange);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        if (!reduceMotion) {
          p.y -= p.speed;
          p.x += p.drift;
          if (p.y < -10) {
            Object.assign(p, makeParticle(), { y: h + 10 });
          }
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
        ctx.fill();
      });

      if (!reduceMotion) {
        animId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('kamui-theme-changed', onThemeChange);
      if (animId) cancelAnimationFrame(animId);
    };
  }, []);

  return <canvas ref={canvasRef} id="ember-canvas" className={className} />;
};

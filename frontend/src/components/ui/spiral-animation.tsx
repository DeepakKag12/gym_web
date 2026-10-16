'use client';
import React, { useEffect, useRef } from 'react';

export interface SpiralAnimationProps {
  className?: string;
  hoverToPlay?: boolean;
  transparent?: boolean;
  particleCount?: number;
  palette?: string[];
}

interface Particle {
  armBaseAngle: number;
  progress: number;
  speed: number;
  color: string;
  baseSize: number;
  zDepth: number;
  dispersion: number;
  phase: number;
}

export function SpiralAnimation({
  className = '',
  hoverToPlay = false,
  transparent = true,
  particleCount = 360,
  palette = ['#3365e2', '#38bdf8', '#60a5fa', '#93c5fd', '#ffffff'],
}: SpiralAnimationProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isHoveredRef = useRef<boolean>(!hoverToPlay);

  useEffect(() => {
    isHoveredRef.current = !hoverToPlay;
  }, [hoverToPlay]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let isRunning = true;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(rect.width || 280, 40);
      height = Math.max(rect.height || 280, 40);
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateSize();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => updateSize());
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', updateSize);
    }

    const count = Math.min(particleCount, 420);
    const arms = 4;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const armIndex = i % arms;
      const armBaseAngle = (armIndex * (2 * Math.PI)) / arms;
      const progress = Math.random();
      const speed = 0.0008 + Math.random() * 0.0014;
      const color = palette[i % palette.length];
      const baseSize = 1.0 + Math.random() * 2.2;
      const zDepth = (Math.random() - 0.5) * 400;
      const dispersion = (Math.random() - 0.5) * 18;

      particles.push({
        armBaseAngle,
        progress,
        speed,
        color,
        baseSize,
        zDepth,
        dispersion,
        phase: Math.random() * Math.PI * 2,
      });
    }

    let globalRotation = 0;
    let lastTime = performance.now();

    const render = (now: number) => {
      if (!isRunning) return;

      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const shouldAnimate = !hoverToPlay || isHoveredRef.current;
      const speedMultiplier = prefersReducedMotion ? 0.15 : shouldAnimate ? 1.0 : 0.25;

      globalRotation += dt * 0.35 * speedMultiplier;

      if (transparent) {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = '#050607';
        ctx.fillRect(0, 0, width, height);
      }

      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.46;
      const focalLength = 320;

      const centralGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius * 0.65);
      centralGlow.addColorStop(0, 'rgba(51, 101, 226, 0.18)');
      centralGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.06)');
      centralGlow.addColorStop(1, 'rgba(51, 101, 226, 0)');
      ctx.fillStyle = centralGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius * 0.65, 0, Math.PI * 2);
      ctx.fill();

      for (let i = 0; i < count; i++) {
        const p = particles[i];

        if (shouldAnimate) {
          p.progress += p.speed * speedMultiplier;
          if (p.progress > 1) {
            p.progress -= 1;
          }
        }

        const t = p.progress;
        const spiralTurns = 3.2;
        const currentAngle = p.armBaseAngle + t * spiralTurns * Math.PI + globalRotation;
        const radius = Math.pow(t, 0.85) * maxRadius + p.dispersion * (1 - t * 0.5);

        const z = p.zDepth * Math.cos(t * Math.PI + p.phase);
        const scale = focalLength / (focalLength + z);

        const x = cx + Math.cos(currentAngle) * radius * scale;
        const y = cy + Math.sin(currentAngle) * radius * scale;

        let alpha = 1;
        if (t < 0.15) {
          alpha = t / 0.15;
        } else if (t > 0.82) {
          alpha = Math.max(0, (1 - t) / 0.18);
        }
        alpha *= Math.min(Math.max(scale * 0.85, 0.2), 1.0);

        if (alpha <= 0.01) continue;

        const size = p.baseSize * scale;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = size * 2.4;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(size, 0.7), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    const handleVisibility = () => {
      if (document.hidden) {
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      } else {
        lastTime = performance.now();
        animFrameRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isRunning = false;
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (resizeObserver) resizeObserver.disconnect();
      else window.removeEventListener('resize', updateSize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [transparent, particleCount, hoverToPlay, palette]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none pointer-events-none ${className}`}
      onMouseEnter={() => {
        if (hoverToPlay) isHoveredRef.current = true;
      }}
      onMouseLeave={() => {
        if (hoverToPlay) isHoveredRef.current = false;
      }}
    >
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />
    </div>
  );
}

export default SpiralAnimation;

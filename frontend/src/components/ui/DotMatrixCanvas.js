import React, { useRef, useEffect } from 'react';

/**
 * DotMatrixCanvas
 * Exact reverse-engineered 2D Canvas Dot-Matrix Physics Engine from Oris Dental.
 * Runs at 60fps with quadratic inverse-falloff magnetic repulsion and velocity lerp damping.
 */
export default function DotMatrixCanvas({
  spacing = 28,
  baseRadius = 1.5,
  maxRadius = 3.8,
  interactionRadius = 160,
  baseOpacity = 0.3,
  maxOpacity = 0.95,
  lerpFactor = 0.32,
  gradient = true,
  shape = 'square',
  className = '',
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let isRunning = false;
    let isVisible = false;
    let isTabVisible = !document.hidden;

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      active: false,
    };

    let dots = [];

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      if (ctx.resetTransform) {
        ctx.resetTransform();
      }
      ctx.scale(dpr, dpr);

      dots = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      const startX = (width - (cols - 1) * spacing) / 2;
      const startY = (height - (rows - 1) * spacing) / 2;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const bx = startX + c * spacing;
          const by = startY + r * spacing;
          const gradFactor = gradient
            ? Math.min(1, Math.max(0.05, Math.pow(by / Math.max(1, height), 1.1)))
            : 1.0;

          dots.push({
            bx,
            by,
            x: bx,
            y: by,
            r: baseRadius,
            alpha: baseOpacity * gradFactor,
            gradFactor,
          });
        }
      }

      drawStatic();
    };

    const drawStatic = () => {
      if (!ctx || width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.x = d.bx;
        d.y = d.by;
        d.r = baseRadius;
        d.alpha = baseOpacity * d.gradFactor;

        if (d.alpha > 0.005) {
          ctx.fillStyle = `rgba(255, 255, 255, ${d.alpha})`;
          if (shape === 'square') {
            const size = 1.9 * d.r;
            ctx.fillRect(d.x - size / 2, d.y - size / 2, size, size);
          } else {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
    };

    const startAnim = () => {
      if (!isRunning && isVisible && isTabVisible) {
        isRunning = true;
        animId = requestAnimationFrame(loop);
      }
    };

    const stopAnim = () => {
      isRunning = false;
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    const onPointerMove = (e) => {
      if (!isVisible) return;
      const rect = canvas.getBoundingClientRect();
      if (
        e.clientX < rect.left - interactionRadius ||
        e.clientX > rect.right + interactionRadius ||
        e.clientY < rect.top - interactionRadius ||
        e.clientY > rect.bottom + interactionRadius
      ) {
        if (mouse.active) {
          mouse.targetX = -1000;
          mouse.targetY = -1000;
          mouse.active = false;
          startAnim();
        }
        return;
      }

      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.active = true;
      startAnim();
    };

    const onPointerLeave = () => {
      if (mouse.active) {
        mouse.targetX = -1000;
        mouse.targetY = -1000;
        mouse.active = false;
        startAnim();
      }
    };

    const loop = () => {
      if (!isVisible || !isTabVisible) {
        isRunning = false;
        return;
      }

      mouse.x += (mouse.targetX - mouse.x) * lerpFactor;
      mouse.y += (mouse.targetY - mouse.y) * lerpFactor;

      ctx.clearRect(0, 0, width, height);
      let hasMovement = false;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = mouse.x - dot.bx;
        const dy = mouse.y - dot.by;
        const dist = Math.hypot(dx, dy);

        let targetX = dot.bx;
        let targetY = dot.by;
        let targetR = baseRadius;
        let targetAlpha = baseOpacity * (dot.gradFactor || 1);

        if (dist < interactionRadius) {
          const norm = 1 - dist / interactionRadius;
          const falloff = norm * norm;
          const angle = Math.atan2(dy, dx);
          const push = 14 * falloff;

          targetX = dot.bx - Math.cos(angle) * push;
          targetY = dot.by - Math.sin(angle) * push;
          targetR = baseRadius + (maxRadius - baseRadius) * falloff;
          targetAlpha =
            (baseOpacity + (maxOpacity - baseOpacity) * falloff) *
            (gradient ? Math.max(0.35, dot.gradFactor) : 1);
        }

        const deltaX = targetX - dot.x;
        const deltaY = targetY - dot.y;
        const deltaR = targetR - dot.r;
        const deltaA = targetAlpha - dot.alpha;

        dot.x += deltaX * lerpFactor;
        dot.y += deltaY * lerpFactor;
        dot.r += deltaR * lerpFactor;
        dot.alpha += deltaA * lerpFactor;

        if (
          Math.abs(deltaX) > 0.02 ||
          Math.abs(deltaY) > 0.02 ||
          Math.abs(deltaR) > 0.01 ||
          Math.abs(deltaA) > 0.003
        ) {
          hasMovement = true;
        }

        if (dot.alpha > 0.005) {
          ctx.fillStyle = `rgba(255, 255, 255, ${dot.alpha})`;
          if (shape === 'square') {
            const size = 1.9 * dot.r;
            ctx.fillRect(dot.x - size / 2, dot.y - size / 2, size, size);
          } else {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }

      if (!mouse.active && !hasMovement && Math.abs(mouse.x - mouse.targetX) < 1) {
        drawStatic();
        isRunning = false;
        return;
      }

      animId = requestAnimationFrame(loop);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            isVisible = true;
            handleResize();
          } else {
            isVisible = false;
            stopAnim();
          }
        }
      },
      { threshold: 0.01 }
    );

    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible && isVisible) {
        startAnim();
      } else {
        stopAnim();
      }
    };

    observer.observe(canvas);
    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      observer.disconnect();
      stopAnim();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [
    spacing,
    baseRadius,
    maxRadius,
    interactionRadius,
    baseOpacity,
    maxOpacity,
    lerpFactor,
    gradient,
    shape,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none z-0 ${className}`}
      style={{
        maskImage:
          'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,1) 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.25) 20%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,1) 100%)',
      }}
    />
  );
}

"use client";

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ax: number;
  ay: number;
}

export default function MurmurationBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;

    // High density, tiny sizes for majestic starling clouds
    const isMobile = width < 768;
    const particleCount = isMobile ? 507 : 1352; 
    const particles: Particle[] = [];

    // True Reynolds Boids configuration for mathematical waves
    const maxSpeed = 1.8;
    const maxForce = 0.025; // Tiny force = graceful, wide swooping turns
    const perceptionRadius = 90;
    const perceptionRadiusSq = perceptionRadius * perceptionRadius;
    const separationRadius = 25;
    const separationRadiusSq = separationRadius * separationRadius;
    const mouseRadius = 350; // Increased so particles visible in the margins react even when hovering over central cards
    const mouseRadiusSq = mouseRadius * mouseRadius;

    let time = 0;

    const limit = (vec: {x: number, y: number}, max: number) => {
      const magSq = vec.x * vec.x + vec.y * vec.y;
      if (magSq > max * max) {
        const mag = Math.sqrt(magSq);
        vec.x = (vec.x / mag) * max;
        vec.y = (vec.y / mag) * max;
      }
    };

    const init = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      particles.length = 0;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * maxSpeed,
          vy: Math.sin(angle) * maxSpeed,
          ax: 0,
          ay: 0,
        });
      }
    };

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, width, height);

      const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                     (!document.documentElement.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);

      // Create a slowly wandering target for the flock to sweep toward
      const targetX = width / 2 + Math.cos(time * 1.1) * (width * 0.35);
      const targetY = height / 2 + Math.sin(time * 0.8) * (height * 0.35);

      particles.forEach((p, i) => {
        let align = { x: 0, y: 0 };
        let coh = { x: 0, y: 0 };
        let sep = { x: 0, y: 0 };
        let count = 0;

        // O(N^2) naive loop is perfectly smooth in modern JS browsers at 800 particles
        for (let j = 0; j < particleCount; j++) {
          if (i === j) continue;
          const other = particles[j];
          const dx = p.x - other.x;
          const dy = p.y - other.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < perceptionRadiusSq) {
            align.x += other.vx;
            align.y += other.vy;
            
            coh.x += other.x;
            coh.y += other.y;
            
            if (distSq < separationRadiusSq && distSq > 0) {
              const dist = Math.sqrt(distSq);
              sep.x += (dx / dist) / dist; // Weight by distance
              sep.y += (dy / dist) / dist;
            }
            count++;
          }
        }

        if (count > 0) {
          // Alignment (Match velocity)
          align.x /= count;
          align.y /= count;
          let alignMag = Math.sqrt(align.x * align.x + align.y * align.y);
          if (alignMag > 0) {
            align.x = (align.x / alignMag) * maxSpeed - p.vx;
            align.y = (align.y / alignMag) * maxSpeed - p.vy;
            limit(align, maxForce);
          }

          // Cohesion (Steer toward center of mass)
          coh.x /= count;
          coh.y /= count;
          const cohDx = coh.x - p.x;
          const cohDy = coh.y - p.y;
          let cohMag = Math.sqrt(cohDx * cohDx + cohDy * cohDy);
          if (cohMag > 0) {
            coh.x = (cohDx / cohMag) * maxSpeed - p.vx;
            coh.y = (cohDy / cohMag) * maxSpeed - p.vy;
            limit(coh, maxForce);
          }

          // Separation (Steer away from crowding)
          let sepMag = Math.sqrt(sep.x * sep.x + sep.y * sep.y);
          if (sepMag > 0) {
            sep.x = (sep.x / sepMag) * maxSpeed - p.vx;
            sep.y = (sep.y / sepMag) * maxSpeed - p.vy;
            limit(sep, maxForce * 1.5); // Separation hits slightly harder
          }
        }

        // Apply rules
        p.ax += align.x * 1.0;
        p.ax += coh.x * 1.0;
        p.ax += sep.x * 1.8;
        
        p.ay += align.y * 1.0;
        p.ay += coh.y * 1.0;
        p.ay += sep.y * 1.8;

        // Wandering pull (gives the majestic swooping goal across the sky)
        const tDx = targetX - p.x;
        const tDy = targetY - p.y;
        const tMag = Math.sqrt(tDx * tDx + tDy * tDy);
        if (tMag > 0) {
          let pullX = (tDx / tMag) * maxSpeed - p.vx;
          let pullY = (tDy / tMag) * maxSpeed - p.vy;
          const pullVec = { x: pullX, y: pullY };
          limit(pullVec, maxForce * 0.15); // Very weak gravitational pull
          p.ax += pullVec.x;
          p.ay += pullVec.y;
        }

        // Mouse Flee (Dispersal)
        const mDx = p.x - mouseRef.current.x;
        const mDy = p.y - mouseRef.current.y;
        const mDistSq = mDx * mDx + mDy * mDy;
        if (mDistSq < mouseRadiusSq) {
          // Much stronger instant burst away from the cursor
          const force = (mouseRadiusSq - mDistSq) / mouseRadiusSq; 
          p.ax += mDx * force * 0.025;
          p.ay += mDy * force * 0.025;
        }

        // Update velocity
        p.vx += p.ax;
        p.vy += p.ay;

        // Limit max speed
        const speedSq = p.vx * p.vx + p.vy * p.vy;
        if (speedSq > maxSpeed * maxSpeed) {
          const speed = Math.sqrt(speedSq);
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Reset acceleration
        p.ax = 0;
        p.ay = 0;

        // Screen wrap
        const margin = 50;
        if (p.x < -margin) p.x = width + margin;
        else if (p.x > width + margin) p.x = -margin;
        
        if (p.y < -margin) p.y = height + margin;
        else if (p.y > height + margin) p.y = -margin;

        // Draw tiny, distinct starlings
        if (isDark) {
          ctx.fillStyle = i % 8 === 0 ? 'rgba(168, 204, 151, 0.5)' : 'rgba(45, 106, 79, 0.3)'; 
        } else {
          ctx.fillStyle = i % 8 === 0 ? '#EBE8D8' : '#E2DEC7'; 
        }
        
        ctx.beginPath();
        // Visible but subtle particles
        ctx.arc(p.x, p.y, isMobile ? 0.5 : 1.0, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent | PointerEvent) => {
      // Support cursor, touch, and generic pointer interactions
      if ('touches' in e && e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else {
        mouseRef.current = { x: (e as MouseEvent | PointerEvent).clientX, y: (e as MouseEvent | PointerEvent).clientY };
      }
    };

    const handleResize = () => {
      init();
    };

    init();
    draw();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove, { passive: true });
    window.addEventListener('pointermove', handleMouseMove as EventListener);
    window.addEventListener('resize', handleResize);
    
    // Re-init on theme change to ensure colors update if theme toggles
    const matchMediaDark = window.matchMedia('(prefers-color-scheme: dark)');
    matchMediaDark.addEventListener('change', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('pointermove', handleMouseMove as EventListener);
      window.removeEventListener('resize', handleResize);
      matchMediaDark.removeEventListener('change', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 murmuration-canvas"
      style={{
        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,1) 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,1) 100%)'
      }}
    />
  );
}

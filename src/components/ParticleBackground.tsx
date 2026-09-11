import React, { useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseStatus: 'alert' | 'processing' | 'trust';
  pulsePhase: number;
}

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useTheme();
  // The render loop reads this ref so a theme switch repaints immediately
  // without tearing down and re-seeding the particle field.
  const isLightRef = useRef(theme === 'light');
  isLightRef.current = theme === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const nodeCount = isReducedMotion ? 20 : isMobile ? 35 : 75;

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let scrollRatio = 0;

    // Create Nodes
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      const isTrustInitial = Math.random() < 0.2;
      const isProcessingInitial = Math.random() < 0.3;
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * (isReducedMotion ? 0.2 : 0.6),
        vy: (Math.random() - 0.5) * (isReducedMotion ? 0.2 : 0.6),
        radius: Math.random() * 2.5 + 1.5,
        baseStatus: isTrustInitial ? 'trust' : isProcessingInitial ? 'processing' : 'alert',
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      scrollRatio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Render loop
    let lastTime = performance.now();
    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      // Smooth mouse damping
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Background gradient - light theme gets a soft cool-white wash so the
      // hero reads as a designed light surface, not an inverted dark one.
      const light = isLightRef.current;
      const bgGrad = ctx.createRadialGradient(mouseX, mouseY, 50, width / 2, height / 2, Math.max(width, height));
      if (light) {
        bgGrad.addColorStop(0, '#FFFFFF');
        bgGrad.addColorStop(0.5, '#F7F9FC');
        bgGrad.addColorStop(1, '#EEF2F8');
      } else {
        bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
        bgGrad.addColorStop(0.5, 'rgba(10, 15, 30, 0.95)');
        bgGrad.addColorStop(1, '#0A0F1E');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Update and Draw Nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!isReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          // Mouse influence parallax
          const dxMouse = mouseX - node.x;
          const dyMouse = mouseY - node.y;
          const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          if (distMouse < 180) {
            const force = (180 - distMouse) / 180;
            node.x -= (dxMouse / distMouse) * force * 0.8;
            node.y -= (dyMouse / distMouse) * force * 0.8;
          }

          // Bounce off bounds
          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;

          node.pulsePhase += dt * 2;
        }

        // Determine node color based on scroll ratio (Red/Threat -> Green/Trust transition)
        const effectiveTrustProb = Math.min(0.95, 0.15 + scrollRatio * 0.85);
        const isTrustNow = (i / nodes.length) < effectiveTrustProb;

        let color = '#FF5A4E'; // Alert Red
        if (isTrustNow) {
          color = '#17C3A0'; // Trust Green
        } else if (node.baseStatus === 'processing' && scrollRatio > 0.3) {
          color = '#2EE6A6'; // Mint/Processing Green
        }

        // Draw node pulse halo
        const pulse = Math.sin(node.pulsePhase) * 0.5 + 0.5;
        const currentRadius = node.radius + pulse * 1.2;

        // On light the neon palette washes out, so use the darker accent
        // tones and drop the glow: visible, but subtle.
        const dotColor = light
          ? color === '#FF5A4E' ? '#D93A2E' : color === '#2EE6A6' ? '#12A883' : '#0E8F74'
          : color;

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = light
          ? (dotColor === '#D93A2E' ? 'rgba(217, 58, 46, 0.10)' : 'rgba(14, 143, 116, 0.10)')
          : (color === '#FF5A4E' ? 'rgba(255, 90, 78, 0.08)' : 'rgba(23, 195, 160, 0.08)');
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.shadowColor = dotColor;
        ctx.shadowBlur = light ? 0 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const node2 = nodes[j];
          const dx = node2.x - node.x;
          const dy = node2.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * (light ? 0.22 : 0.18);
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(node2.x, node2.y);
            ctx.strokeStyle = light
              ? (isTrustNow ? `rgba(14, 143, 116, ${alpha})` : `rgba(217, 58, 46, ${alpha * 0.8})`)
              : (isTrustNow ? `rgba(23, 195, 160, ${alpha})` : `rgba(255, 90, 78, ${alpha * 0.8})`);
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      style={{ opacity: 0.95 }}
    />
  );
};

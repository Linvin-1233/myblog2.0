"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type Particle = {
  x: number;
  startY: number;
  endY: number;
  drift: number;
  size: number;
  delay: number;
  alpha: number;
};

// Keep a stable visual handoff even when a static route was already prefetched.
// This does not delay data fetching; it guarantees a minimum transition window.
const DURATION = 1300;

function easeInOut(value: number): number {
  return value < 0.5
    ? 2 * value * value
    : 1 - Math.pow(-2 * value + 2, 2) / 2;
}

export function RouteParticleTransition() {
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    const width = window.innerWidth;
    const height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const rootStyles = getComputedStyle(document.documentElement);
    const color = rootStyles.getPropertyValue("--poster-ice").trim() || "#bfecff";
    const background = rootStyles.getPropertyValue("--poster-bg").trim() || "#03050a";
    const fontFamily = rootStyles.getPropertyValue("--font-jetbrains").trim() || "monospace";
    const mobile = width < 768;
    const columns = mobile ? 12 : 20;
    const count = mobile ? 58 : 104;
    const particles: Particle[] = Array.from({ length: count }, (_, index) => {
      const column = index % columns;
      const columnWidth = width / columns;
      return {
        x: column * columnWidth + columnWidth * (0.28 + (index % 5) * 0.11),
        startY: -40 - (index % 9) * height * 0.13,
        endY: height + 80 + (index % 7) * 32,
        drift: ((index % 7) - 3) * 4,
        size: 2 + (index % 5) * 1.4,
        delay: (index % 17) * 0.012,
        alpha: 0.3 + (index % 4) * 0.14,
      };
    });
    const startedAt = performance.now();

    const draw = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / DURATION);
      context.clearRect(0, 0, width, height);

      const curtain = Math.min(1, progress * 8, (1 - progress) * 10);
      context.globalAlpha = curtain * 0.9;
      context.fillStyle = background;
      context.fillRect(0, 0, width, height);

      // Fixed data columns give the waterfall a machine-readable structure.
      context.strokeStyle = color;
      context.lineWidth = 1;
      context.globalAlpha = curtain * 0.08;
      for (let column = 1; column < columns; column++) {
        const x = column * (width / columns);
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }

      context.fillStyle = color;
      for (const particle of particles) {
        const local = Math.max(0, Math.min(1, (progress - particle.delay) / (1 - particle.delay)));
        const phase = easeInOut(local);
        const faultShift = progress > 0.43 && progress < 0.6
          ? ((Math.floor(progress * 90 + particle.x) % 5) - 2) * 9
          : 0;
        const x = particle.x + particle.drift * phase + faultShift;
        const y = particle.startY + (particle.endY - particle.startY) * phase;
        context.globalAlpha = Math.sin(local * Math.PI) * particle.alpha;
        context.fillRect(x, y, particle.size, particle.size);
        if (particle.size > 5) {
          context.globalAlpha *= 0.2;
          context.fillRect(x, y - particle.size * 4, 1, particle.size * 3);
        }
      }

      const phase = progress < 0.2
        ? "CAPTURING ROUTE"
        : progress < 0.48
          ? "COMPRESSING DATA"
          : progress < 0.78
            ? "DECODING FRAME"
            : "SYNCING VIEW";
      const hudAlpha = curtain * 0.82;
      const margin = mobile ? 16 : 32;
      const hugeSize = Math.max(34, Math.min(mobile ? 54 : 92, width * 0.09));

      // Top system rail spans the viewport instead of behaving like a widget.
      context.globalAlpha = hudAlpha;
      context.fillStyle = color;
      context.font = `700 10px ${fontFamily}`;
      context.textBaseline = "top";
      context.fillText("SYS://ROUTE_BUFFER", margin, 22);
      context.textAlign = "right";
      context.fillText(`TARGET ${pathname.toUpperCase()}`, width - margin, 22);
      context.textAlign = "left";
      context.globalAlpha = hudAlpha * 0.45;
      context.fillRect(margin, 42, width - margin * 2, 1);

      // Oversized phase text anchors the whole-screen takeover.
      context.globalAlpha = hudAlpha * 0.78;
      context.font = `700 ${hugeSize}px ${fontFamily}`;
      context.textBaseline = "middle";
      context.fillText(phase, margin, height * 0.52);
      context.font = `700 8px ${fontFamily}`;
      context.textBaseline = "top";
      context.globalAlpha = hudAlpha * 0.58;
      context.fillText("DATA WATERFALL / FRAME RECONSTRUCTION", margin, height * 0.52 + hugeSize * 0.62);

      // Horizontal glitch interference occupies full-width strips.
      if (progress > 0.4 && progress < 0.66) {
        const fault = Math.sin((progress - 0.4) * 74);
        context.globalAlpha = Math.abs(fault) * 0.18;
        for (let index = 0; index < 4; index++) {
          const y = height * (0.2 + index * 0.19) + fault * 18;
          context.fillRect(index % 2 ? width * 0.13 : 0, y, width * (0.56 + index * 0.08), 3 + index);
        }
      }

      // Bottom progress rail spans the entire screen.
      const segments = mobile ? 18 : 30;
      const gap = 4;
      const barX = margin;
      const barY = height - 38;
      const barWidth = width - margin * 2 - 70;
      const segmentWidth = (barWidth - gap * (segments - 1)) / segments;
      const activeSegments = Math.ceil(progress * segments);
      for (let index = 0; index < segments; index++) {
        context.globalAlpha = hudAlpha * (index < activeSegments ? 0.8 : 0.12);
        context.fillRect(barX + index * (segmentWidth + gap), barY, segmentWidth, 7);
      }
      context.globalAlpha = hudAlpha;
      context.font = `700 10px ${fontFamily}`;
      context.textAlign = "right";
      context.fillText(`${Math.round(progress * 100).toString().padStart(3, "0")}%`, width - margin, height - 42);
      context.textAlign = "left";

      context.globalAlpha = 1;
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(draw);
      } else {
        context.clearRect(0, 0, width, height);
        frameRef.current = 0;
      }
    };

    frameRef.current = requestAnimationFrame(draw);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      context.clearRect(0, 0, width, height);
    };
  }, [pathname]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-80 h-full w-full"
      aria-hidden="true"
    />
  );
}

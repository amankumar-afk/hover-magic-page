import { useEffect, useRef } from "react";

interface Point {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
}

const ParticleMesh = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const pointsRef = useRef<Point[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initPoints();
    };

    const COLS = 40;
    const ROWS = 12;
    const MOUSE_RADIUS = 150;
    const MOUSE_STRENGTH = 40;

    const initPoints = () => {
      const pts: Point[] = [];
      const w = canvas.width;
      const h = canvas.height;
      const startY = h * 0.65;
      const spacingX = w / (COLS - 1);
      const spacingY = (h - startY) / (ROWS - 1);

      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const x = col * spacingX;
          const baseY = startY + row * spacingY;
          // Add wave offset
          const waveOffset = Math.sin(col * 0.3 + row * 0.5) * 15 + Math.cos(col * 0.15) * 10;
          const y = baseY + waveOffset;
          pts.push({ x, y, baseX: x, baseY: y, vx: 0, vy: 0 });
        }
      }
      pointsRef.current = pts;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const pts = pointsRef.current;
      const mouse = mouseRef.current;
      const time = Date.now() * 0.001;

      // Update points
      for (const p of pts) {
        // Ambient wave motion
        const wave = Math.sin(time + p.baseX * 0.003) * 3 + Math.cos(time * 0.7 + p.baseY * 0.005) * 2;
        let targetY = p.baseY + wave;
        let targetX = p.baseX;

        // Mouse interaction
        const dx = mouse.x - p.baseX;
        const dy = mouse.y - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * MOUSE_STRENGTH;
          targetX = p.baseX - (dx / dist) * force;
          targetY = targetY - (dy / dist) * force;
        }

        p.vx += (targetX - p.x) * 0.08;
        p.vy += (targetY - p.y) * 0.08;
        p.vx *= 0.85;
        p.vy *= 0.85;
        p.x += p.vx;
        p.y += p.vy;
      }

      // Draw connections and dots
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const i = row * COLS + col;
          const p = pts[i];
          const normalizedRow = row / (ROWS - 1);
          const alpha = 0.08 + normalizedRow * 0.25;

          // Draw horizontal line
          if (col < COLS - 1) {
            const next = pts[i + 1];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(next.x, next.y);
            ctx.strokeStyle = `hsla(0, 67%, 50%, ${alpha * 0.6})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }

          // Draw vertical line
          if (row < ROWS - 1) {
            const below = pts[i + COLS];
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(below.x, below.y);
            ctx.strokeStyle = `hsla(0, 67%, 50%, ${alpha * 0.4})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }

          // Draw dot
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2 + normalizedRow * 1, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 67%, 50%, ${alpha})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", handleMouse);
    canvas.addEventListener("mouseleave", handleLeave);
    resize();
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouse);
      canvas.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-auto z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default ParticleMesh;

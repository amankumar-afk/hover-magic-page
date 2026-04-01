import { useEffect, useRef } from "react";

/**
 * 3D perspective particle terrain — a "floating floor" of dots
 * that undulates with waves and reacts to mouse hover.
 */

interface GridPoint {
  // 3D world coordinates
  wx: number;
  wy: number;
  wz: number;
  baseWy: number;
  // projected 2D
  sx: number;
  sy: number;
  scale: number;
  // physics
  vy: number;
}

const COLS = 80;
const ROWS = 45;
const SPACING = 0.35;
const CAMERA_HEIGHT = 4.5;
const CAMERA_Z = -3;
const FOV = 600;
const MOUSE_RADIUS_3D = 3;
const MOUSE_STRENGTH = 1.8;

const ParticleMesh = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const mouse3DRef = useRef({ wx: 0, wz: 0, active: false });
  const pointsRef = useRef<GridPoint[]>([]);
  const animRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const project = (wx: number, wy: number, wz: number) => {
      const { w, h } = sizeRef.current;
      const relZ = wz - CAMERA_Z;
      if (relZ <= 0.1) return { sx: -9999, sy: -9999, scale: 0 };
      const scale = FOV / relZ;
      const sx = w / 2 + wx * scale;
      const sy = h * 0.42 + (wy - CAMERA_HEIGHT) * scale;
      return { sx, sy, scale };
    };

    const initPoints = () => {
      const pts: GridPoint[] = [];
      const halfCols = (COLS - 1) / 2;
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const wx = (col - halfCols) * SPACING;
          const wz = row * SPACING + 1;
          const wy = 0;
          const { sx, sy, scale } = project(wx, wy, wz);
          pts.push({ wx, wy, wz, baseWy: wy, sx, sy, scale, vy: 0 });
        }
      }
      pointsRef.current = pts;
    };

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { w: window.innerWidth, h: window.innerHeight };
      initPoints();
    };

    const unprojectMouse = (mx: number, my: number) => {
      // Approximate: cast onto the y=0 plane
      const { w, h } = sizeRef.current;
      // We solve for wz where wy≈0 intersects the mouse ray
      // sy = h*0.42 + (0 - CAMERA_HEIGHT) * FOV / (wz - CAMERA_Z)
      // => (my - h*0.42) = -CAMERA_HEIGHT * FOV / (wz - CAMERA_Z)
      // => wz - CAMERA_Z = -CAMERA_HEIGHT * FOV / (my - h*0.42)
      const denom = my - h * 0.42;
      if (Math.abs(denom) < 1) return { wx: 0, wz: 0, active: false };
      const relZ = (-CAMERA_HEIGHT * FOV) / denom;
      const wz = relZ + CAMERA_Z;
      if (wz < 0.5) return { wx: 0, wz: 0, active: false };
      const scale = FOV / relZ;
      const wx = (mx - w / 2) / scale;
      return { wx, wz, active: true };
    };

    const animate = () => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      const pts = pointsRef.current;
      const time = Date.now() * 0.0003;
      const m3d = mouse3DRef.current;

      // Update world positions
      for (const p of pts) {
        // Terrain waves
        const wave1 = Math.sin(p.wx * 0.6 + time * 1.2) * 0.6;
        const wave2 = Math.cos(p.wz * 0.4 + time * 0.8) * 0.5;
        const wave3 = Math.sin((p.wx + p.wz) * 0.35 + time * 0.6) * 0.7;
        const wave4 = Math.sin(p.wx * 1.2 + time * 2) * 0.2;
        let targetWy = wave1 + wave2 + wave3 + wave4;

        // Mouse push — raises terrain near cursor
        if (m3d.active) {
          const dx = p.wx - m3d.wx;
          const dz = p.wz - m3d.wz;
          const dist = Math.sqrt(dx * dx + dz * dz);
          if (dist < MOUSE_RADIUS_3D) {
            const force = (1 - dist / MOUSE_RADIUS_3D);
            const push = force * force * MOUSE_STRENGTH;
            targetWy += push;
          }
        }

        p.vy += (targetWy - p.wy) * 0.1;
        p.vy *= 0.82;
        p.wy += p.vy;

        const proj = project(p.wx, p.wy, p.wz);
        p.sx = proj.sx;
        p.sy = proj.sy;
        p.scale = proj.scale;
      }

      // Draw back-to-front (far rows first)
      for (let row = ROWS - 1; row >= 0; row--) {
        for (let col = 0; col < COLS; col++) {
          const i = row * COLS + col;
          const p = pts[i];
          if (p.sx < -50 || p.sx > w + 50 || p.sy < -50 || p.sy > h + 50) continue;

          const depthFactor = Math.min(p.scale / (FOV / 2), 1);
          const alpha = depthFactor * depthFactor * 0.9 + 0.12;

          // Horizontal connection
          if (col < COLS - 1) {
            const next = pts[i + 1];
            if (next.sx > -50 && next.sx < w + 50) {
              ctx.beginPath();
              ctx.moveTo(p.sx, p.sy);
              ctx.lineTo(next.sx, next.sy);
              ctx.strokeStyle = `hsla(0, 0%, 100%, ${alpha * 0.45})`;
              ctx.lineWidth = Math.max(0.4, depthFactor * 1.1);
              ctx.stroke();
            }
          }

          // Depth connection
          if (row < ROWS - 1) {
            const below = pts[i + COLS];
            if (below.sx > -50 && below.sx < w + 50) {
              ctx.beginPath();
              ctx.moveTo(p.sx, p.sy);
              ctx.lineTo(below.sx, below.sy);
              ctx.strokeStyle = `hsla(0, 0%, 100%, ${alpha * 0.3})`;
              ctx.lineWidth = Math.max(0.3, depthFactor * 0.7);
              ctx.stroke();
            }
          }

          // Dot
          const radius = Math.max(0.6, depthFactor * 2.8);
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(0, 0%, 100%, ${alpha})`;
          ctx.fill();
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      mouseRef.current = { x: mx, y: my };
      mouse3DRef.current = unprojectMouse(mx, my);
    };

    const handleLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
      mouse3DRef.current = { wx: 0, wz: 0, active: false };
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
    />
  );
};

export default ParticleMesh;

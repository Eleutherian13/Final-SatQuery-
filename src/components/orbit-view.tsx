import { useEffect, useRef, useState } from "react";
import type { Observation } from "@/lib/types";

/**
 * Signature acquisition-geometry visualisation: a restrained wireframe globe
 * with one orbital observation marker per loaded observation, and a downlink
 * line to the analysed footprint. Canvas 2D, no external 3D dependency.
 */
export function OrbitView({ observations }: { observations: Observation[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spin, setSpin] = useState(0.6);
  const dragRef = useRef<number | null>(null);
  const spinRef = useRef(spin);
  spinRef.current = spin;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;

    const styles = getComputedStyle(canvas);
    const border = styles.getPropertyValue("--color-border") || "#334";
    const primary = styles.getPropertyValue("--color-primary") || "#5cf";
    const optical = styles.getPropertyValue("--color-optical") || "#6c9";
    const sar = styles.getPropertyValue("--color-sar") || "#a9f";
    const muted = styles.getPropertyValue("--color-muted-foreground") || "#889";

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2 + 6;
      const r = Math.min(w, h) * 0.3;
      const rot = spinRef.current + t * 0.0016;

      // globe outline
      ctx.strokeStyle = border;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // parallels
      for (let i = -2; i <= 2; i++) {
        const lat = (i * Math.PI) / 7;
        const rr = r * Math.cos(lat);
        const yy = cy - r * Math.sin(lat);
        ctx.beginPath();
        ctx.ellipse(cx, yy, rr, rr * 0.22, 0, 0, Math.PI * 2);
        ctx.strokeStyle = border;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
      // meridians
      for (let i = 0; i < 6; i++) {
        const a = rot + (i * Math.PI) / 6;
        const rr = Math.abs(Math.cos(a)) * r;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rr, r, 0, 0, Math.PI * 2);
        ctx.strokeStyle = border;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // analysed footprint
      const fa = rot * 0.8;
      const fx = cx + Math.sin(fa) * r * 0.42;
      const fy = cy - r * 0.18;
      ctx.fillStyle = primary;
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(fx, fy, 7, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // observation markers on orbit
      observations.forEach((obs, i) => {
        const a = rot * 0.6 + i * 1.5 + 0.4;
        const orbitR = r * 1.5;
        const ox = cx + Math.cos(a) * orbitR;
        const oy = cy + Math.sin(a) * orbitR * 0.32;
        const color = obs.modality === "sar" ? sar : optical;

        ctx.strokeStyle = border;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, orbitR, orbitR * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // downlink
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(fx, fy);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        ctx.fillStyle = color;
        ctx.fillRect(ox - 2.5, oy - 2.5, 5, 5);

        ctx.fillStyle = muted;
        ctx.font = "9px ui-monospace, monospace";
        ctx.fillText(
          `${(obs.metadata.sensor ?? "sensor").toUpperCase()} · ${obs.modality.toUpperCase()}`,
          ox + 7,
          oy + 3,
        );
        ctx.fillText(obs.metadata.acquiredAt ?? "", ox + 7, oy + 14);
      });

      t += 1;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [observations]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Acquisition geometry visualisation"
      onPointerDown={(e) => {
        dragRef.current = e.clientX;
      }}
      onPointerUp={() => {
        dragRef.current = null;
      }}
      onPointerMove={(e) => {
        if (dragRef.current == null) return;
        setSpin((s) => s + (e.clientX - dragRef.current!) * 0.01);
        dragRef.current = e.clientX;
      }}
      className="h-[190px] w-full cursor-grab"
    />
  );
}

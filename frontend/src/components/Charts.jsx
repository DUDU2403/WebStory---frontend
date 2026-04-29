import { useEffect, useRef } from 'react';

// Resolve cor do tema atual para uso no canvas (canvas não lê CSS vars)
function resolveVar(varName, fallback) {
  if (typeof document === 'undefined') return fallback;
  const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return val || fallback;
}

// ── LineChart ────────────────────────────────────────────────
export function LineChart({ data = [], title, height = 260, color = '#10b981' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const surface  = resolveVar('--surface',   '#ffffff');
    const gridClr  = resolveVar('--border',    '#e5e7eb');
    const textClr  = resolveVar('--text-3',    '#9ca3af');

    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth;
    const H   = height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pad = { top: 16, right: 18, bottom: 36, left: 44 };
    const cW  = W - pad.left - pad.right;
    const cH  = H - pad.top  - pad.bottom;

    // bg
    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, W, H);

    const vals   = data.map(d => d.value);
    const maxVal = Math.max(...vals, 1);
    const minVal = Math.min(...vals, 0);
    const range  = maxVal - minVal || 1;

    // y-axis labels + grid
    ctx.font      = `11px DM Sans, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillStyle = textClr;
    const steps   = 4;
    for (let i = 0; i <= steps; i++) {
      const v   = minVal + ((maxVal - minVal) * (steps - i) / steps);
      const y   = pad.top + (i * cH / steps);
      ctx.fillText(Number.isInteger(v) ? v : v.toFixed(1), pad.left - 6, y + 4);
      ctx.strokeStyle = gridClr;
      ctx.lineWidth   = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // axes
    ctx.strokeStyle = gridClr;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, H - pad.bottom);
    ctx.lineTo(W - pad.right, H - pad.bottom);
    ctx.stroke();

    // gradient fill under line
    const grad = ctx.createLinearGradient(0, pad.top, 0, H - pad.bottom);
    grad.addColorStop(0,   color + '28');
    grad.addColorStop(1,   color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = pad.left + (i / (data.length - 1 || 1)) * cW;
      const y = pad.top  + (1 - (point.value - minVal) / range) * cH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    const lastX = pad.left + cW;
    const lastY = H - pad.bottom;
    ctx.lineTo(lastX, lastY);
    ctx.lineTo(pad.left, lastY);
    ctx.closePath();
    ctx.fill();

    // line
    ctx.strokeStyle = color;
    ctx.lineWidth   = 2.5;
    ctx.lineJoin    = 'round';
    ctx.lineCap     = 'round';
    ctx.beginPath();
    data.forEach((point, i) => {
      const x = pad.left + (i / (data.length - 1 || 1)) * cW;
      const y = pad.top  + (1 - (point.value - minVal) / range) * cH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // dots
    data.forEach((point, i) => {
      const x = pad.left + (i / (data.length - 1 || 1)) * cW;
      const y = pad.top  + (1 - (point.value - minVal) / range) * cH;
      ctx.fillStyle   = surface;
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // x labels
    ctx.fillStyle  = textClr;
    ctx.textAlign  = 'center';
    ctx.font       = `11px DM Sans, sans-serif`;
    const maxLabels = Math.min(data.length, 8);
    const step      = Math.ceil(data.length / maxLabels);
    data.forEach((point, i) => {
      if (i % step !== 0 && i !== data.length - 1) return;
      const x = pad.left + (i / (data.length - 1 || 1)) * cW;
      ctx.fillText(point.label, x, H - pad.bottom + 18);
    });
  }, [data, color, height]);

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-1)' }}>{title}</p>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height, display: 'block', borderRadius: 10, border: '1px solid var(--border)' }}
      />
    </div>
  );
}

// ── BarChart ─────────────────────────────────────────────────
export function BarChart({ data = [], title, height = 260, color = '#10b981' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const surface = resolveVar('--surface',  '#ffffff');
    const gridClr = resolveVar('--border',   '#e5e7eb');
    const textClr = resolveVar('--text-3',   '#9ca3af');
    const text1   = resolveVar('--text-1',   '#111827');

    const dpr = window.devicePixelRatio || 1;
    const W   = canvas.offsetWidth;
    const H   = height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const pad = { top: 24, right: 18, bottom: 36, left: 44 };
    const cW  = W - pad.left - pad.right;
    const cH  = H - pad.top  - pad.bottom;

    ctx.fillStyle = surface;
    ctx.fillRect(0, 0, W, H);

    const maxVal = Math.max(...data.map(d => d.value), 1);
    const steps  = 4;

    // grid + y labels
    ctx.font      = `11px DM Sans, sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillStyle = textClr;
    for (let i = 0; i <= steps; i++) {
      const v = maxVal * (steps - i) / steps;
      const y = pad.top + (i * cH / steps);
      ctx.fillText(Number.isInteger(v) ? v : v.toFixed(1), pad.left - 6, y + 4);
      ctx.strokeStyle = gridClr;
      ctx.lineWidth   = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(W - pad.right, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // axes
    ctx.strokeStyle = gridClr;
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(pad.left, pad.top);
    ctx.lineTo(pad.left, H - pad.bottom);
    ctx.lineTo(W - pad.right, H - pad.bottom);
    ctx.stroke();

    // bars
    const slotW  = cW / data.length;
    const barW   = Math.min(slotW * 0.6, 48);

    data.forEach((item, i) => {
      const x      = pad.left + i * slotW + (slotW - barW) / 2;
      const bH     = (item.value / maxVal) * cH;
      const y      = H - pad.bottom - bH;
      const barClr = item.color || color;

      // rounded top corners via path
      const r = Math.min(5, barW / 2, bH / 2);
      ctx.fillStyle = barClr;
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + barW - r, y);
      ctx.quadraticCurveTo(x + barW, y, x + barW, y + r);
      ctx.lineTo(x + barW, H - pad.bottom);
      ctx.lineTo(x, H - pad.bottom);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
      ctx.fill();

      // value label on top
      ctx.fillStyle  = text1;
      ctx.font       = `bold 11px DM Sans, sans-serif`;
      ctx.textAlign  = 'center';
      ctx.fillText(item.value, x + barW / 2, y - 5);

      // x label
      ctx.fillStyle  = textClr;
      ctx.font       = `11px DM Sans, sans-serif`;
      ctx.fillText(item.label, x + barW / 2, H - pad.bottom + 18);
    });
  }, [data, color, height]);

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: 'var(--text-1)' }}>{title}</p>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height, display: 'block', borderRadius: 10, border: '1px solid var(--border)' }}
      />
    </div>
  );
}

// ── PieChart ─────────────────────────────────────────────────
export function PieChart({
  data = [],
  title,
  size = 220,
  colors = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'],
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const surface = resolveVar('--surface', '#ffffff');
    const dpr     = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    const ctx     = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    const cx     = size / 2;
    const cy     = size / 2;
    const radius = size / 2 - 12;
    const total  = data.reduce((s, d) => s + d.value, 0) || 1;

    let angle = -Math.PI / 2;
    data.forEach((item, i) => {
      const slice = (item.value / total) * Math.PI * 2;
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, angle, angle + slice);
      ctx.closePath();
      ctx.fill();

      // separator
      ctx.strokeStyle = surface;
      ctx.lineWidth   = 2;
      ctx.stroke();

      // percentage label
      const mid = angle + slice / 2;
      const lx  = cx + Math.cos(mid) * radius * 0.64;
      const ly  = cy + Math.sin(mid) * radius * 0.64;
      const pct = Math.round((item.value / total) * 100);
      if (pct >= 5) {
        ctx.fillStyle      = 'white';
        ctx.font           = `bold 12px DM Sans, sans-serif`;
        ctx.textAlign      = 'center';
        ctx.textBaseline   = 'middle';
        ctx.fillText(pct + '%', lx, ly);
      }

      angle += slice;
    });
  }, [data, size, colors]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {title && (
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-1)', alignSelf: 'flex-start' }}>{title}</p>
      )}
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size, display: 'block', borderRadius: '50%', border: '1px solid var(--border)' }}
      />
      {/* legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px', justifyContent: 'center' }}>
        {data.map((item, i) => (
          <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-2)' }}>
            <span style={{ width: 10, height: 10, borderRadius: 2, background: colors[i % colors.length], flexShrink: 0 }} />
            {item.label}
          </span>
        ))}
      </div>
    </div>
  );
}
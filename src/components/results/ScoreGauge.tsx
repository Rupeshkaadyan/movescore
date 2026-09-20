import type { MoveScoreBreakdown } from "@/lib/types";
import { cn } from "@/lib/cn";

const BAND_COLORS: Record<MoveScoreBreakdown["band"], string> = {
  excellent: "#10b981",
  good: "#34d399",
  mixed: "#f59e0b",
  risky: "#ef4444",
};

export function ScoreGauge({
  breakdown,
  size = 180,
  className,
}: {
  breakdown: MoveScoreBreakdown;
  size?: number;
  className?: string;
}) {
  const score = Math.max(0, Math.min(100, breakdown.score));
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  const color = BAND_COLORS[breakdown.band];

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`MoveScore ${score} out of 100`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold tabular-nums tracking-tight text-ink">
          {score}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          / 100
        </span>
      </div>
    </div>
  );
}

export function ScoreBandLabel({ breakdown }: { breakdown: MoveScoreBreakdown }) {
  const labels: Record<MoveScoreBreakdown["band"], string> = {
    excellent: "Strong fit",
    good: "Good fit",
    mixed: "Mixed",
    risky: "Stretch",
  };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{
        borderColor: `${BAND_COLORS[breakdown.band]}33`,
        backgroundColor: `${BAND_COLORS[breakdown.band]}14`,
        color: BAND_COLORS[breakdown.band],
      }}
    >
      {labels[breakdown.band]}
    </span>
  );
}

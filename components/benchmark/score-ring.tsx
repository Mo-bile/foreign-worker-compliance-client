"use client";

import { useId } from "react";

interface ScoreRingProps {
  readonly score: number;
  readonly size?: number;
}

export function ScoreRing({ score, size = 180 }: ScoreRingProps) {
  const id = useId();
  const center = size / 2;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="관리 수준 점수"
      >
        <defs>
          <linearGradient id={`${id}-gradient`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="oklch(0.75 0.15 145)" />
            <stop offset="100%" stopColor="oklch(0.75 0.15 85)" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={12}
          className="stroke-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={12}
          stroke={`url(#${id}-gradient)`}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold">{score}</span>
      </div>
    </div>
  );
}

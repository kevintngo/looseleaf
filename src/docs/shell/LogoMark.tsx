import { cn } from "@/lib/utils"

const RULES = [14.5, 20.5, 26.5, 32.5, 38.5]
const HOLES = [12.8, 24.4, 36]

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg data-slot="logo-mark" viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className={cn("shrink-0 overflow-visible", className)}>
      <g transform="rotate(-6 26 24)">
        <path
          d="M14.6 5.1Q26.4 4.5 38.6 4.8Q41 4.9 41.1 7.3Q41.6 24.4 41.4 40.9Q41.3 43.3 38.9 43.4Q25.8 44 14.2 43.8Q11.8 43.7 11.8 41.4Q11.6 24 12 7.6Q12.1 5.2 14.6 5.1Z"
          fill="var(--ll-paper)"
          stroke="var(--ll-ink)"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        {RULES.map((y) => (
          <path key={y} d={`M22.8 ${y}H38.4`} stroke="var(--ll-ink-you)" strokeOpacity="0.5" strokeWidth="1.2" strokeLinecap="round" />
        ))}
        <path d="M24.2 20.1Q30.2 19.4 35.6 20" stroke="var(--ll-marker)" strokeOpacity="0.9" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <path d="M20.6 5.8L20.8 43" stroke="var(--ll-red)" strokeOpacity="0.85" strokeWidth="1.3" strokeLinecap="round" />
        {HOLES.map((y) => (
          <circle key={y} cx="16.2" cy={y} r="2.1" fill="var(--ll-desk)" stroke="var(--ll-ink)" strokeWidth="1.5" />
        ))}
      </g>
    </svg>
  )
}

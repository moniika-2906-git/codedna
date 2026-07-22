import { cn } from "@/lib/utils";

const scoreStyles = (score: number) => {
  if (score >= 80) {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
  }
  if (score >= 50) {
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  }
  return "border-red-500/30 bg-red-500/10 text-red-400";
};

interface ScoreBadgeProps {
  score: number;
}

export const ScoreBadge = ({ score }: ScoreBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        scoreStyles(score)
      )}
    >
      {score}
    </span>
  );
};

import { cn } from "@/lib/utils";

type Difficulty = "EASY" | "MEDIUM" | "HARD";

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  EASY: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  MEDIUM: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  HARD: "border-red-500/30 bg-red-500/10 text-red-400",
};

interface DifficultyBadgeProps {
  difficulty: Difficulty;
}

export const DifficultyBadge = ({ difficulty }: DifficultyBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        DIFFICULTY_STYLES[difficulty]
      )}
    >
      {difficulty}
    </span>
  );
};

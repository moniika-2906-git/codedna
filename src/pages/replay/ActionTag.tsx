import { cn } from "@/lib/utils";

type PromptAction = "ASKED" | "ACCEPTED" | "REJECTED" | "MODIFIED";

const ACTION_STYLES: Record<PromptAction, string> = {
  ASKED: "border-zinc-700 bg-zinc-800 text-zinc-300",
  ACCEPTED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  MODIFIED: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
  REJECTED: "border-red-500/30 bg-red-500/10 text-red-400",
};

interface ActionTagProps {
  action: PromptAction;
}

export const ActionTag = ({ action }: ActionTagProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        ACTION_STYLES[action]
      )}
    >
      {action}
    </span>
  );
};

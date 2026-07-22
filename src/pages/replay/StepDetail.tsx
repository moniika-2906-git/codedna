import { Bot, User } from "lucide-react";
import { Doc } from "../../../convex/_generated/dataModel";
import { ActionTag } from "./ActionTag";

interface StepDetailProps {
  step: Doc<"promptLogs">;
  stepIndex: number;
}

export const StepDetail = ({ step, stepIndex }: StepDetailProps) => {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          Step {stepIndex + 1}
        </p>
        <ActionTag action={step.action} />
      </div>

      <div className="flex items-start gap-2">
        <User className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
        <p className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-100">
          {step.prompt}
        </p>
      </div>

      <div className="flex items-start gap-2">
        <Bot className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
        <p className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
          {step.aiResponse}
        </p>
      </div>
    </div>
  );
};

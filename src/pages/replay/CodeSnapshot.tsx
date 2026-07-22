import { Info } from "lucide-react";
import { CodeEditor } from "@/pages/assessment/CodeEditor";

interface CodeSnapshotProps {
  code: string;
  isFinalStep: boolean;
}

/**
 * The schema only stores the final submitted code, not a per-step snapshot.
 * Prompt logs are the finest granularity available, so we show the final
 * code for every step and clearly label whether the step being viewed is
 * the last one (closest to representing "this step's code").
 */
export const CodeSnapshot = ({ code, isFinalStep }: CodeSnapshotProps) => {
  return (
    <div className="flex h-full flex-col gap-2 p-4">
      <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-400">
        <Info className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
        {isFinalStep
          ? "Final submitted code at this step."
          : "No per-step code snapshot is stored — showing the final submitted code for reference."}
      </div>
      <div className="flex-1">
        <CodeEditor value={code} onChange={() => {}} readOnly />
      </div>
    </div>
  );
};

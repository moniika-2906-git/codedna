import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DifficultyBadge } from "@/pages/problems/DifficultyBadge";
import { Doc } from "../../../convex/_generated/dataModel";

interface ProblemPanelProps {
  problem: Doc<"problems">;
}

export const ProblemPanel = ({ problem }: ProblemPanelProps) => {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <h1 className="text-xl font-semibold text-zinc-100">
          {problem.title}
        </h1>
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-400">
        {problem.description}
      </p>

      <Card className="mt-6 rounded-xl border-zinc-800 bg-zinc-900">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-zinc-300">
            Example
          </CardTitle>
          <CardDescription className="sr-only">Example input and output</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Input
            </p>
            <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
              {problem.exampleInput}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500">
              Output
            </p>
            <pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 font-mono text-xs text-zinc-300">
              {problem.exampleOutput}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubmissionResultProps {
  score: number;
  label: string;
  totalPrompts: number;
  onBackToProblems: () => void;
}

export const SubmissionResult = ({
  score,
  label,
  totalPrompts,
  onBackToProblems,
}: SubmissionResultProps) => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md rounded-xl border-zinc-800 bg-zinc-900 text-center">
        <CardHeader className="items-center gap-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
            <CheckCircle2 className="h-6 w-6 text-indigo-400" />
          </div>
          <CardTitle className="text-lg text-zinc-100">
            Assessment Submitted
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-4xl font-bold text-indigo-400">{score}</p>
          <p className="text-sm text-zinc-400">{label}</p>
          <p className="text-xs text-zinc-500">
            Based on {totalPrompts} AI interaction
            {totalPrompts === 1 ? "" : "s"}
          </p>
          <Button
            onClick={onBackToProblems}
            className="mt-2 w-full bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
          >
            Back to Problems
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

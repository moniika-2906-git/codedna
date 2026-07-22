import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "convex/react";
import { ArrowLeft, History } from "lucide-react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { RequireRole } from "@/components/auth/RequireRole";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { StepDetail } from "./StepDetail";
import { CodeSnapshot } from "./CodeSnapshot";
import { ReplayControls } from "./ReplayControls";

const AUTO_ADVANCE_MS = 2000;

const ReplayPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const session = useQuery(
    api.sessions.getById,
    sessionId ? { sessionId: sessionId as Id<"sessions"> } : "skip"
  );

  const steps = useMemo(() => session?.promptLogs ?? [], [session]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Clamp the step index whenever the underlying step count changes.
  useEffect(() => {
    setCurrentStep((prev) => Math.min(prev, Math.max(steps.length - 1, 0)));
  }, [steps.length]);

  const handleNext = useCallback(() => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  // Auto-advance while playing; stop automatically at the last step.
  useEffect(() => {
    if (!isPlaying) return;
    if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timeout = setTimeout(handleNext, AUTO_ADVANCE_MS);
    return () => clearTimeout(timeout);
  }, [isPlaying, currentStep, steps.length, handleNext]);

  const activeStep = steps[currentStep];
  const isFinalStep = currentStep === steps.length - 1;

  return (
    <RequireRole allowedRoles={["RECRUITER"]} redirectTo="/problems">
      {session === undefined ? (
        <div className="container py-12">
          <Skeleton className="h-96 rounded-xl bg-zinc-900" />
        </div>
      ) : session === null ? (
        <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center text-zinc-400">
          Session not found.
        </div>
      ) : (
        <div className="flex h-[calc(100vh-4rem)] flex-col">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-3">
              <Link
                to={`/dashboard/candidate/${sessionId}`}
                className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
              <span className="text-zinc-700">/</span>
              <div className="flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                <History className="h-4 w-4 text-indigo-400" />
                Replay — {session.user?.name ?? "Unknown candidate"} ·{" "}
                {session.problemName}
              </div>
            </div>
          </div>

          {steps.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-zinc-400">
              <p>No AI interactions were logged for this session.</p>
              <p className="text-sm text-zinc-500">
                Showing the final submitted code instead.
              </p>
              <div className="mt-4 h-96 w-full max-w-3xl px-6">
                <CodeSnapshot code={session.code} isFinalStep />
              </div>
            </div>
          ) : (
            <>
              <ResizablePanelGroup direction="horizontal" className="flex-1">
                <ResizablePanel defaultSize={45} minSize={30}>
                  {activeStep && (
                    <StepDetail step={activeStep} stepIndex={currentStep} />
                  )}
                </ResizablePanel>
                <ResizableHandle withHandle className="bg-zinc-800" />
                <ResizablePanel defaultSize={55} minSize={30}>
                  <CodeSnapshot code={session.code} isFinalStep={isFinalStep} />
                </ResizablePanel>
              </ResizablePanelGroup>

              <ReplayControls
                currentStep={currentStep}
                totalSteps={steps.length}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((prev) => !prev)}
                onPrevious={() => {
                  setIsPlaying(false);
                  handlePrevious();
                }}
                onNext={() => {
                  setIsPlaying(false);
                  handleNext();
                }}
                onScrub={(step) => {
                  setIsPlaying(false);
                  setCurrentStep(step);
                }}
              />
            </>
          )}
        </div>
      )}
    </RequireRole>
  );
};

export default ReplayPage;

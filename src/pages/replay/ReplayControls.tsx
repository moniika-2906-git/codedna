import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface ReplayControlsProps {
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onScrub: (step: number) => void;
}

export const ReplayControls = ({
  currentStep,
  totalSteps,
  isPlaying,
  onTogglePlay,
  onPrevious,
  onNext,
  onScrub,
}: ReplayControlsProps) => {
  return (
    <div className="flex flex-col gap-3 border-t border-zinc-800 bg-zinc-900 px-4 py-3">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onPrevious}
          disabled={currentStep <= 0}
          className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          onClick={onTogglePlay}
          disabled={totalSteps === 0}
          className="bg-indigo-500 text-zinc-50 hover:bg-indigo-400"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNext}
          disabled={currentStep >= totalSteps - 1}
          className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <SkipForward className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <Slider
            value={[currentStep]}
            min={0}
            max={Math.max(totalSteps - 1, 0)}
            step={1}
            disabled={totalSteps === 0}
            onValueChange={([value]) => onScrub(value)}
          />
        </div>

        <span className="w-24 shrink-0 text-right text-sm text-zinc-400">
          {totalSteps === 0
            ? "No steps"
            : `Step ${currentStep + 1} of ${totalSteps}`}
        </span>
      </div>
    </div>
  );
};

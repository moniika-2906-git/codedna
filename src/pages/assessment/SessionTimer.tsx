import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface SessionTimerProps {
  startedAt: number;
}

const formatElapsed = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

export const SessionTimer = ({ startedAt }: SessionTimerProps) => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-sm font-medium text-zinc-300">
      <Clock className="h-4 w-4 text-indigo-400" />
      {formatElapsed(now - startedAt)}
    </div>
  );
};

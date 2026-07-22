import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const ProblemCardSkeleton = () => {
  return (
    <Card className="rounded-xl border-zinc-800 bg-zinc-900">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <Skeleton className="h-6 w-32 bg-zinc-800" />
          <Skeleton className="h-5 w-14 rounded-full bg-zinc-800" />
        </div>
        <Skeleton className="mt-2 h-4 w-full bg-zinc-800" />
        <Skeleton className="h-4 w-2/3 bg-zinc-800" />
      </CardHeader>
      <CardContent />
    </Card>
  );
};

import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
}

export const StatCard = ({ icon: Icon, label, value }: StatCardProps) => {
  return (
    <Card className="rounded-xl border-zinc-800 bg-zinc-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-400">
          {label}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
          <Icon className="h-4 w-4 text-indigo-400" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-zinc-100">{value}</p>
      </CardContent>
    </Card>
  );
};

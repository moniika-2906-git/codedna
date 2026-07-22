import {
  MessageSquareCode,
  Dna,
  History,
  GraduationCap,
  FolderGit2,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: MessageSquareCode,
    title: "Prompt Tracking",
    description:
      "Every AI prompt, acceptance, rejection, and edit is logged to reveal how a candidate actually collaborates with AI.",
  },
  {
    icon: Dna,
    title: "Engineering DNA",
    description:
      "A weighted collaboration score turns raw prompt logs into a single signal of independent problem-solving skill.",
  },
  {
    icon: History,
    title: "Interview Replay",
    description:
      "Step back through any session's code changes and AI conversation to see exactly how the solution evolved.",
  },
  {
    icon: GraduationCap,
    title: "Campus Hiring",
    description:
      "Run structured, scalable assessments across student cohorts with consistent, comparable scoring.",
  },
  {
    icon: FolderGit2,
    title: "Real Projects",
    description:
      "Evaluate candidates on practical, real-world problems instead of memorized algorithm trivia.",
  },
];

export const FeatureGrid = () => {
  return (
    <section className="border-b border-zinc-800 py-20">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
            Built to measure real engineering skill
          </h2>
          <p className="mt-3 text-zinc-400">
            A complete picture of how a candidate thinks, prompts, and builds.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="rounded-xl border-zinc-800 bg-zinc-900 transition-colors hover:border-zinc-700"
            >
              <CardHeader>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10">
                  <feature.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <CardTitle className="text-lg text-zinc-100">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-zinc-400">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

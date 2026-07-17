import { LucideIcon, Sparkles, Dna, History, Building2, Code } from "lucide-react";
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
    icon: Sparkles,
    title: "Prompt Tracking",
    description:
      "Every AI interaction during the assessment is logged and analyzed to understand how candidates collaborate with AI tools.",
  },
  {
    icon: Dna,
    title: "Engineering DNA",
    description:
      "A unique scoring model that measures problem-solving approach, not just final output correctness.",
  },
  {
    icon: History,
    title: "Interview Replay",
    description:
      "Step back through a candidate's entire coding process keystroke by keystroke to see exactly how they reached their solution.",
  },
  {
    icon: Building2,
    title: "Campus Hiring",
    description:
      "Built for scale across India's 40,000+ engineering colleges, streamlining technical hiring for recruiters.",
  },
  {
    icon: Code,
    title: "Real Projects",
    description:
      "Assessments modeled on real-world engineering tasks, not just algorithmic puzzles.",
  },
];

const Features = () => {
  return (
    <section className="bg-zinc-950 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Everything you need to assess talent
          </h2>
          <p className="mt-4 text-zinc-400">
            A complete toolkit for running fair, consistent, and insightful
            technical interviews.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card
              key={feature.title}
              className="border-zinc-800 bg-zinc-900/50 transition-colors hover:border-zinc-700"
            >
              <CardHeader>
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10">
                  <feature.icon className="h-5 w-5 text-indigo-400" />
                </div>
                <CardTitle className="text-xl text-zinc-100">
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

export default Features;